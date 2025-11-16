/**
 * PriceEvolutionChart Component
 * 
 * Shows a simple line chart of price evolution over time
 * This is a basic implementation using SVG - for more advanced charts,
 * consider installing react-native-chart-kit or react-native-svg-charts
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../theme/theme';
import { formatCurrency } from '../utils/ebayPriceService';

const { width: screenWidth } = Dimensions.get('window');

const PriceEvolutionChart = ({ item }) => {
  const { colors } = useTheme();
  
  // Get price history
  const priceHistory = item.price_history || [];
  
  if (priceHistory.length < 2) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>📊 Price Evolution</Text>
        <View style={[styles.noDataContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
            Not enough price data to show chart
          </Text>
          <Text style={[styles.noDataSubtext, { color: colors.textSecondary }]}>
            Update prices a few times to see evolution
          </Text>
        </View>
      </View>
    );
  }

  // Prepare data for chart
  const sortedHistory = [...priceHistory]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10); // Show last 10 data points

  const prices = sortedHistory.map(entry => entry.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Chart dimensions
  const chartWidth = screenWidth - 64; // Account for padding
  const chartHeight = 120;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingHorizontal = 20;
  
  const chartInnerWidth = chartWidth - (paddingHorizontal * 2);
  const chartInnerHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate points for the line
  const dataPoints = sortedHistory.map((entry, index) => {
    const x = paddingHorizontal + (index * chartInnerWidth) / (sortedHistory.length - 1);
    const normalizedPrice = priceRange > 0 ? (entry.price - minPrice) / priceRange : 0.5;
    const y = paddingTop + chartInnerHeight - (normalizedPrice * chartInnerHeight);
    
    return { x, y, price: entry.price, date: entry.date };
  });

  // Create SVG path
  const pathData = dataPoints.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Determine trend color
  const firstPrice = dataPoints[0].price;
  const lastPrice = dataPoints[dataPoints.length - 1].price;
  const trend = lastPrice > firstPrice ? 'up' : lastPrice < firstPrice ? 'down' : 'neutral';
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>📊 Price Evolution</Text>
        <View style={styles.trendIndicator}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➖'}
            {((lastPrice - firstPrice) / firstPrice * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {/* Simple chart using basic React Native components */}
          <View style={[styles.chart, { width: chartWidth, height: chartHeight, backgroundColor: colors.background }]}>
            
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <View
                key={`grid-${index}`}
                style={[styles.gridLine, {
                  backgroundColor: colors.border,
                  top: paddingTop + (chartInnerHeight * ratio),
                  left: paddingHorizontal,
                  width: chartInnerWidth,
                }]}
              />
            ))}

            {/* Price line using positioned dots */}
            {dataPoints.map((point, index) => (
              <React.Fragment key={`point-${index}`}>
                {/* Line segment to next point */}
                {index < dataPoints.length - 1 && (
                  <View
                    style={[styles.lineSegment, {
                      backgroundColor: trendColor,
                      left: point.x,
                      top: point.y,
                      width: Math.sqrt(
                        Math.pow(dataPoints[index + 1].x - point.x, 2) +
                        Math.pow(dataPoints[index + 1].y - point.y, 2)
                      ),
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            dataPoints[index + 1].y - point.y,
                            dataPoints[index + 1].x - point.x
                          )}rad`
                        }
                      ]
                    }]}
                  />
                )}
                
                {/* Data point */}
                <View
                  style={[styles.dataPoint, {
                    backgroundColor: trendColor,
                    left: point.x - 3,
                    top: point.y - 3,
                  }]}
                />
              </React.Fragment>
            ))}

            {/* Y-axis labels */}
            {[maxPrice, (maxPrice + minPrice) / 2, minPrice].map((price, index) => (
              <Text
                key={`y-label-${index}`}
                style={[styles.yAxisLabel, {
                  color: colors.textSecondary,
                  top: paddingTop + (chartInnerHeight * index / 2) - 8,
                  left: 2,
                }]}
              >
                ${price.toFixed(0)}
              </Text>
            ))}
          </View>

          {/* X-axis labels */}
          <View style={[styles.xAxisContainer, { width: chartWidth }]}>
            {dataPoints.map((point, index) => {
              // Only show labels for first, middle, and last points to avoid crowding
              if (index !== 0 && index !== Math.floor(dataPoints.length / 2) && index !== dataPoints.length - 1) {
                return null;
              }
              
              return (
                <Text
                  key={`x-label-${index}`}
                  style={[styles.xAxisLabel, {
                    color: colors.textSecondary,
                    position: 'absolute',
                    left: point.x - 20,
                    textAlign: 'center',
                    width: 40,
                  }]}
                >
                  {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              );
            })}
          </View>

          {/* Price summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Min</Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>{formatCurrency(minPrice)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Max</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(maxPrice)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Current</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(lastPrice)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 12,
  },
  chartContainer: {
    minWidth: screenWidth - 32,
  },
  chart: {
    borderRadius: 8,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    opacity: 0.3,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 10,
  },
  xAxisContainer: {
    height: 20,
    position: 'relative',
    marginTop: 4,
  },
  xAxisLabel: {
    fontSize: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PriceEvolutionChart;