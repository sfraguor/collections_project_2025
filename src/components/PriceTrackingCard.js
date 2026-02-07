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
  ActivityIndicator,
  Alert,
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
        `New market price: ${formatCurrency(updatedItem.current_market_price, updatedItem.current_market_currency)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Price update error:', error);
      
      // Show user-friendly error messages based on error type
      let errorTitle = 'Update Failed';
      let errorMessage = 'Failed to update market price. Please try again.';
      
      if (error.message.includes('server error (500)')) {
        errorTitle = 'eBay Server Busy';
        errorMessage = 'eBay servers are temporarily unavailable. Please try again in a few minutes.';
      } else if (error.message.includes('rate limit')) {
        errorTitle = 'Too Many Requests';
        errorMessage = 'Please wait a moment before updating prices again.';
      } else if (error.message.includes('access denied')) {
        errorTitle = 'Access Issue';
        errorMessage = 'There\'s an issue with eBay API access. Please contact support.';
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Try Mock Data', 
            onPress: () => tryMockUpdate(),
            style: 'default'
          }
        ]
      );
    } finally {
      setUpdating(false);
    }
  };

  // Fallback function to use mock data when API fails
  const tryMockUpdate = async () => {
    try {
      setUpdating(true);
      
      // Generate mock price based on item name/search terms
      const mockPrice = generateMockPrice(item.ebay_search_terms);
      
      const updatedItem = {
        ...item,
        current_market_price: mockPrice,
        current_market_currency: item.currency || 'EUR',
        last_price_update: new Date().toISOString(),
        price_history: [
          ...(item.price_history || []),
          {
            price: mockPrice,
            currency: item.currency || 'EUR',
            date: new Date().toISOString(),
            source: 'mock-fallback'
          }
        ].slice(-50)
      };
      
      if (onItemUpdated) {
        onItemUpdated(updatedItem);
      }
      
      Alert.alert(
        'Demo Price Updated',
        `Demo market price: ${formatCurrency(mockPrice, item.currency || 'EUR')}\n\n(Note: This is simulated data since eBay API is unavailable)`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Mock update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Generate realistic mock price
  const generateMockPrice = (searchTerms) => {
    const basePrice = item.purchase_price || 100;
    const variation = (Math.random() - 0.3) * 0.5; // -30% to +20% variation
    return Math.round(basePrice * (1 + variation) * 100) / 100;
  };

  // Get data source label for transparency
  const getDataSourceLabel = (item) => {
    const priceHistory = item.price_history || [];
    const lastEntry = priceHistory[priceHistory.length - 1];
    
    if (!lastEntry) return 'No data';
    
    switch (lastEntry.source) {
      case 'ebay-api':
        return '📊 eBay Real Data';
      case 'mock-intelligent':
        return '🎯 Estimated Data';
      case 'mock-temporary':
        return '⚡ Intelligent Mock';
      case 'mock-fallback':
        return '📈 Demo Data';
      case 'cached':
        return '💾 Cached eBay Data';
      default:
        return '❓ Unknown Source';
    }
  };

  // Show detailed data information
  const showDataDetails = (item) => {
    const priceHistory = item.price_history || [];
    const lastEntry = priceHistory[priceHistory.length - 1];
    
    let detailsMessage = `🔍 DETALLES DE LOS DATOS\n\n`;
    
    if (!lastEntry) {
      detailsMessage += `❌ No hay datos de precio disponibles.`;
    } else {
      detailsMessage += `📊 Precio de mercado: ${formatCurrency(lastEntry.price, lastEntry.currency)}\n`;
      detailsMessage += `📅 Última actualización: ${new Date(lastEntry.date).toLocaleString()}\n\n`;
      
      switch (lastEntry.source) {
        case 'ebay-api':
          detailsMessage += `✅ DATOS REALES DE EBAY\n`;
          detailsMessage += `• Fuente: API oficial de eBay\n`;
          detailsMessage += `• Búsqueda: "${item.ebay_search_terms}"\n`;
          detailsMessage += `• Basado en ${lastEntry.itemCount || 'varios'} artículos similares\n`;
          detailsMessage += `• Rango de precios: ${formatCurrency(lastEntry.priceRange?.min)} - ${formatCurrency(lastEntry.priceRange?.max)}\n`;
          
          // Show calculation method
          if (lastEntry.items && lastEntry.items.length > 0) {
            detailsMessage += `\n📊 CÁLCULO DE LA MEDIA:\n`;
            lastEntry.items.forEach((ebayItem, index) => {
              detailsMessage += `${index + 1}. ${formatCurrency(ebayItem.price)} - ${ebayItem.condition}\n`;
            });
            detailsMessage += `\n💡 Media aritmética: (${lastEntry.items.map(i => formatCurrency(i.price)).join(' + ')}) ÷ ${lastEntry.items.length}`;
          }
          break;
          
        case 'mock-intelligent':
          detailsMessage += `🎯 DATOS ESTIMADOS\n`;
          detailsMessage += `• Fuente: Algoritmo inteligente\n`;
          detailsMessage += `• Basado en términos: "${item.ebay_search_terms}"\n`;
          detailsMessage += `• Precio base estimado según categoría\n`;
          detailsMessage += `• Ajustado por moneda (${lastEntry.currency})\n\n`;
          detailsMessage += `⚠️ NOTA: Estos son datos estimados porque:\n`;
          detailsMessage += `• eBay API tiene límites de uso\n`;
          detailsMessage += `• Se evita hacer demasiadas llamadas\n`;
          detailsMessage += `• Los datos se actualizarán con eBay real cuando sea posible`;
          break;

        case 'mock-temporary':
          detailsMessage += `⚡ DATOS MOCK INTELIGENTES\n`;
          detailsMessage += `• Fuente: Sistema inteligente temporal\n`;
          detailsMessage += `• Búsqueda simulada: "${item.ebay_search_terms}"\n`;
          detailsMessage += `• Categoría detectada: ${lastEntry.category || 'General'}\n`;
          detailsMessage += `• Basado en ${lastEntry.itemCount} artículos simulados\n`;
          detailsMessage += `• Rango de precios: ${formatCurrency(lastEntry.priceRange?.min)} - ${formatCurrency(lastEntry.priceRange?.max)}\n\n`;
          detailsMessage += `🔧 MODO TEMPORAL ACTIVO:\n`;
          detailsMessage += `• eBay API tiene problemas de autenticación\n`;
          detailsMessage += `• App ID necesita renovación/reactivación\n`;
          detailsMessage += `• Datos generados inteligentemente por categoría\n`;
          detailsMessage += `• Se restaurará automáticamente cuando API funcione\n\n`;
          detailsMessage += `💡 Los precios son realistas basados en:\n`;
          detailsMessage += `• Tipo de producto (${lastEntry.category})\n`;
          detailsMessage += `• Términos de búsqueda específicos\n`;
          detailsMessage += `• Variaciones de condición (Nuevo/Usado)\n`;
          detailsMessage += `• Conversión de moneda apropiada`;
          break;
          
        case 'cached':
          detailsMessage += `💾 DATOS DE CACHÉ\n`;
          detailsMessage += `• Fuente: eBay API (guardado anteriormente)\n`;
          detailsMessage += `• Datos guardados para evitar límites de API\n`;
          detailsMessage += `• Válido por 24 horas desde la consulta original\n`;
          
          // Show cached calculation if available
          if (lastEntry.items && lastEntry.items.length > 0) {
            detailsMessage += `\n📊 CÁLCULO GUARDADO:\n`;
            lastEntry.items.forEach((ebayItem, index) => {
              detailsMessage += `${index + 1}. ${formatCurrency(ebayItem.price)} - ${ebayItem.condition}\n`;
            });
            detailsMessage += `\n💡 Media: ${formatCurrency(lastEntry.averagePrice)}`;
          }
          break;
          
        default:
          detailsMessage += `❓ FUENTE DESCONOCIDA\n`;
          detailsMessage += `• Tipo: ${lastEntry.source}`;
      }
    }
    
    const buttons = [
      { text: 'Cerrar', style: 'cancel' }
    ];
    
    // Add "See eBay Links" button for real data
    if (lastEntry && (lastEntry.source === 'ebay-api' || lastEntry.source === 'cached') && lastEntry.items && lastEntry.items.length > 0) {
      buttons.unshift({
        text: 'Ver Enlaces eBay',
        onPress: () => showEbayLinks(lastEntry.items, item.ebay_search_terms)
      });
    }
    
    buttons.push({ 
      text: 'Forzar Actualización Real', 
      onPress: () => forceRealUpdate(),
      style: 'default'
    });
    
    Alert.alert(
      'Transparencia de Datos',
      detailsMessage,
      buttons
    );
  };

  // Show eBay links and detailed calculation
  const showEbayLinks = (items, searchTerms) => {
    let linksMessage = `🔗 ENLACES DE EBAY UTILIZADOS\n\n`;
    linksMessage += `🔍 Búsqueda: "${searchTerms}"\n`;
    linksMessage += `📊 Artículos encontrados: ${items.length}\n\n`;
    
    items.forEach((item, index) => {
      linksMessage += `${index + 1}. ${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''}\n`;
      linksMessage += `   💰 ${formatCurrency(item.price)} (${item.condition})\n`;
      linksMessage += `   🔗 ${item.url}\n\n`;
    });
    
    linksMessage += `📈 CÁLCULO FINAL:\n`;
    const prices = items.map(item => item.price);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    linksMessage += `• Precios: ${prices.map(p => formatCurrency(p)).join(', ')}\n`;
    linksMessage += `• Media: ${formatCurrency(average)}\n`;
    linksMessage += `• Rango: ${formatCurrency(Math.min(...prices))} - ${formatCurrency(Math.max(...prices))}`;
    
    Alert.alert(
      'Enlaces de eBay',
      linksMessage,
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Copiar Primer Link', onPress: () => copyToClipboard(items[0]?.url) }
      ]
    );
  };

  // Copy to clipboard (you might want to install expo-clipboard for this)
  const copyToClipboard = async (url) => {
    try {
      // For now, just show the URL in an alert
      // You can implement actual clipboard functionality later
      Alert.alert('URL Copiada', url);
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar el enlace');
    }
  };

  // Force real eBay update (ignoring rate limits for one call)
  const forceRealUpdate = () => {
    Alert.alert(
      'Forzar Actualización',
      '¿Qué tipo de actualización quieres hacer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar Caché + Buscar', 
          onPress: () => clearCacheAndUpdate(),
          style: 'destructive'
        },
        { 
          text: 'Solo Buscar', 
          onPress: handleUpdatePrice
        }
      ]
    );
  };

  // Clear cache and force fresh API call
  const clearCacheAndUpdate = async () => {
    try {
      if (!item.ebay_search_terms) {
        Alert.alert('Error', 'Este artículo no tiene términos de búsqueda configurados');
        return;
      }

      console.log('🗑️ Clearing cache for:', item.ebay_search_terms);
      
      // Import cache clearing function
      const { clearSpecificCache } = await import('../utils/priceCache');
      await clearSpecificCache(item.ebay_search_terms, item.currency || 'EUR');
      
      console.log('✅ Cache cleared, forcing fresh API call...');
      
      // Now force update
      await handleUpdatePrice();
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'No se pudo limpiar el caché: ' + error.message);
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
              <TouchableOpacity 
                style={styles.transparencyButton}
                onPress={() => showDataDetails(item)}
              >
                <Text style={[styles.transparencyButtonText, { color: colors.textSecondary }]}>
                  {getDataSourceLabel(item)}
                </Text>
              </TouchableOpacity>
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
          <Text style={[styles.warningText, { color: colors.info, fontSize: 12, fontStyle: 'italic' }]}>
            (Will use cached data if available to avoid rate limits)
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
  transparencyButton: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  transparencyButtonText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
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