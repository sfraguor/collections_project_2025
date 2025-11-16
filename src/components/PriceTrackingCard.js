/**
 * PriceTrackingCard Component
 * 
 * Shows detailed price tracking information for individual items
 * including purchase price, current market price, gain/loss, and update controls
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { updateItemMarketPrice, calculateInvestmentPerformance, formatCurrency, formatPercentChange } from '../utils/ebayPriceService';
import { updateItemPriceHistory, getPriceTrend } from '../utils/priceHistoryService';

const PriceTrackingCard = ({ item, collectionId, onItemUpdated }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  // Calculate investment performance
  const performance = calculateInvestmentPerformance(item);
  const trend = getPriceTrend(item);

  const handleUpdatePrice = async () => {
    if (!item.ebay_search_terms || !item.ebay_search_terms.trim()) {
      Alert.alert(
        'No Search Terms',
        'Please add eBay search terms in the item edit screen to enable price tracking.',
        [{ text: 'OK' }]
      );
      return;
    }

    setUpdating(true);
    try {
      const updatedItem = await updateItemPriceHistory(user?.id, collectionId, item);
      
      if (onItemUpdated) {
        onItemUpdated(updatedItem);
      }
      
      Alert.alert(
        'Price Updated',
        `New market price: ${formatCurrency(updatedItem.current_market_price)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error.message || 'Failed to update market price. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUpdating(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend.direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➖';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend.direction) {
      case 'up': return colors.success;
      case 'down': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  // Don't render if no price tracking data
  if (!item.purchase_price && !item.current_market_price) {
    return null;
  }

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.card, 
      borderColor: colors.border,
      borderWidth: 1 
    }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>💹 Price Tracking</Text>
        {item.ebay_search_terms && (
          <TouchableOpacity
            style={[styles.updateButton, { 
              backgroundColor: colors.primary,
              opacity: updating ? 0.7 : 1 
            }]}
            onPress={handleUpdatePrice}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>🔄</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <View style={[styles.priceCard, { backgroundColor: colors.info }]}>
            <Text style={styles.priceLabel}>Purchase Price</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(performance.purchasePrice)}
            </Text>
          </View>
          
          {performance.hasData && (
            <View style={[styles.priceCard, { backgroundColor: colors.warning }]}>
              <Text style={styles.priceLabel}>Market Price</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(performance.currentPrice)}
              </Text>
              {item.last_price_update && (
                <Text style={[styles.updateDate, { color: colors.textSecondary }]}>
                  {new Date(item.last_price_update).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}
        </View>

        {performance.hasData && (
          <View style={[styles.performanceCard, {
            backgroundColor: performance.status === 'profit' ? colors.success : 
                           performance.status === 'loss' ? colors.danger : colors.textSecondary,
            borderColor: performance.status === 'profit' ? colors.success : 
                        performance.status === 'loss' ? colors.danger : colors.textSecondary,
          }]}>
            <View style={styles.performanceContent}>
              <Text style={[styles.performanceLabel, { color: '#fff' }]}>
                {performance.status === 'profit' ? '🚀 Gain' : 
                 performance.status === 'loss' ? '📉 Loss' : '➖ No Change'}
              </Text>
              <Text style={[styles.performanceValue, { color: '#fff' }]}>
                {formatCurrency(Math.abs(performance.difference))} {formatPercentChange(performance.percentChange)}
              </Text>
            </View>
          </View>
        )}

        {trend.dataPoints > 1 && (
          <View style={[styles.trendCard, { borderColor: colors.border }]}>
            <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
              Price Trend ({trend.dataPoints} updates)
            </Text>
            <View style={styles.trendContent}>
              <Text style={[styles.trendIcon, { color: getTrendColor(trend) }]}>
                {getTrendIcon(trend)}
              </Text>
              <Text style={[styles.trendText, { color: colors.text }]}>
                {trend.direction === 'up' ? 'Increasing' : 
                 trend.direction === 'down' ? 'Decreasing' : 'Stable'}
                {Math.abs(trend.shortTermChangePercent) > 0 && (
                  ` (${formatPercentChange(trend.shortTermChangePercent)} recent)`
                )}
              </Text>
            </View>
          </View>
        )}
      </View>

      {!item.ebay_search_terms && (
        <View style={[styles.warningCard, { 
          backgroundColor: colors.warning + '20', 
          borderColor: colors.warning 
        }]}>
          <Text style={[styles.warningText, { color: colors.warning }]}>
            💡 Add eBay search terms to enable automatic price tracking
          </Text>
        </View>
      )}

      {item.ebay_search_terms && !item.current_market_price && (
        <View style={[styles.warningCard, { 
          backgroundColor: colors.info + '20', 
          borderColor: colors.info 
        }]}>
          <Text style={[styles.warningText, { color: colors.info }]}>
            ℹ️ Tap update button to get current market price
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
  },
  priceSection: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  updateDate: {
    fontSize: 10,
    marginTop: 2,
    color: '#fff',
    opacity: 0.8,
  },
  performanceCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
  },
  performanceContent: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  trendCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  trendLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendIcon: {
    fontSize: 16,
  },
  trendText: {
    fontSize: 14,
    flex: 1,
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default PriceTrackingCard;