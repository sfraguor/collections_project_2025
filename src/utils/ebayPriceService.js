/**
 * eBay Finding API Service for Price Tracking
 * 
 * This service uses the eBay Finding API to get current market prices
 * for items based on search terms provided by users.
 * 
 * NOTE: You will need to register for eBay Developer account and get API keys:
 * https://developer.ebay.com/
 */

// eBay Finding API Configuration
// Environment Configuration
const EBAY_ENVIRONMENT = 'sandbox'; // Change to 'production' when approved

// API Keys
const EBAY_SANDBOX_APP_ID = 'SergioFr-Collecti-SBX-26e85ef25-c81e5fd3';
const EBAY_PRODUCTION_APP_ID = 'YOUR_PRODUCTION_APP_ID_HERE'; // Replace when you get it

// Choose the right configuration
const EBAY_APP_ID = EBAY_ENVIRONMENT === 'production' 
  ? EBAY_PRODUCTION_APP_ID 
  : EBAY_SANDBOX_APP_ID;

const EBAY_FINDING_API_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';

// Log current environment
console.log(`🏷️ eBay API Environment: ${EBAY_ENVIRONMENT.toUpperCase()}`);
console.log(`🔑 Using App ID: ${EBAY_APP_ID.substring(0, 10)}...`);

/**
 * Search eBay for items matching the given search terms
 * @param {string} searchTerms - Keywords to search for
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results with price information
 */
export const searcheBayPrices = async (searchTerms, options = {}) => {
  if (!searchTerms || !searchTerms.trim()) {
    throw new Error('Search terms are required');
  }

  // Check if using real API or mock data
  const isUsingMockData = EBAY_APP_ID === 'YOUR_EBAY_APP_ID';
  
  if (isUsingMockData) {
    return mockEbayResponse(searchTerms);
  }
  
  console.log('🛒 Using real eBay API for:', searchTerms);

  try {
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'GLOBAL-ID': options.globalId || 'EBAY-US', // Default to US eBay
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': searchTerms,
      'paginationInput.entriesPerPage': options.maxResults || 10,
      'sortOrder': options.sortOrder || 'PricePlusShipping', // Sort by price
      'itemFilter(0).name': 'Condition',
      'itemFilter(0).value(0)': 'New',
      'itemFilter(0).value(1)': 'Used',
      'itemFilter(1).name': 'MinPrice',
      'itemFilter(1).value': '1', // Min price to avoid $0 listings
      'itemFilter(1).paramName': 'Currency',
      'itemFilter(1).paramValue': 'USD',
      'itemFilter(2).name': 'ListingType',
      'itemFilter(2).value(0)': 'FixedPrice',
      'itemFilter(2).value(1)': 'AuctionWithBIN'
    });

    const response = await fetch(`${EBAY_FINDING_API_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('eBay API HTTP Error:', response.status, response.statusText);
      throw new Error(`eBay API HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ eBay API Response received');
    
    // Check for API-level errors
    if (data.findItemsByKeywordsResponse?.[0]?.ack?.[0] === 'Failure') {
      const errorMessage = data.findItemsByKeywordsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0];
      throw new Error(`eBay API Error: ${errorMessage || 'Unknown error'}`);
    }
    
    return parseEbayResponse(data);

  } catch (error) {
    console.error('eBay API Error:', error);
    throw new Error(`Failed to fetch eBay prices: ${error.message}`);
  }
};

/**
 * Parse eBay Finding API response to extract price information
 * @param {Object} ebayResponse - Raw eBay API response
 * @returns {Object} Parsed price data
 */
const parseEbayResponse = (ebayResponse) => {
  try {
    console.log('📊 Parsing eBay response...');
    const searchResult = ebayResponse.findItemsByKeywordsResponse?.[0]?.searchResult?.[0];
    
    if (!searchResult || !searchResult.item || searchResult.item.length === 0) {
      console.log('❌ No items found in eBay response');
      return {
        success: false,
        error: 'No items found',
        averagePrice: null,
        priceRange: null,
        itemCount: 0,
        items: []
      };
    }

    console.log(`📦 Found ${searchResult.item.length} items, processing...`);
    
    const items = searchResult.item.map(item => {
      const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0');
      const title = item.title?.[0] || 'Unknown Item';
      const currency = item.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || 'USD';
      const condition = item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown';
      const url = item.viewItemURL?.[0] || '';
      const imageUrl = item.galleryURL?.[0] || item.pictureURLLarge?.[0] || '';
      const endTime = item.listingInfo?.[0]?.endTime?.[0] || '';
      
      return {
        title,
        price,
        currency,
        condition,
        url,
        imageUrl,
        endTime
      };
    }).filter(item => item.price && item.price > 0);

    if (items.length === 0) {
      console.log('❌ No valid items with prices found');
      return {
        success: false,
        error: 'No valid items with prices found',
        averagePrice: null,
        priceRange: null,
        itemCount: 0,
        items: []
      };
    }

    const prices = items.map(item => item.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    console.log(`✅ Successfully parsed ${items.length} items, avg price: $${averagePrice.toFixed(2)}`);

    return {
      success: true,
      averagePrice: Math.round(averagePrice * 100) / 100,
      priceRange: {
        min: Math.round(minPrice * 100) / 100,
        max: Math.round(maxPrice * 100) / 100
      },
      itemCount: items.length,
      items: items.slice(0, 5), // Return top 5 items
      lastUpdated: new Date().toISOString(),
      source: 'ebay-api'
    };

  } catch (error) {
    console.error('Error parsing eBay response:', error);
    return {
      success: false,
      error: 'Failed to parse eBay response',
      averagePrice: null,
      priceRange: null,
      itemCount: 0,
      items: []
    };
  }
};

/**
 * Mock eBay response for development/testing
 * @param {string} searchTerms - Search terms to generate mock data for
 * @returns {Object} Mock price data
 */
const mockEbayResponse = (searchTerms) => {
  console.log('🔄 Using mock eBay data for:', searchTerms);
  
  // Generate realistic mock prices based on search terms
  const basePrice = searchTerms.toLowerCase().includes('iphone') ? 800 :
                   searchTerms.toLowerCase().includes('laptop') ? 1200 :
                   searchTerms.toLowerCase().includes('watch') ? 300 :
                   searchTerms.toLowerCase().includes('card') ? 50 :
                   100; // Default base price

  const mockItems = [];
  for (let i = 0; i < 5; i++) {
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const price = basePrice + (basePrice * variation);
    mockItems.push({
      title: `${searchTerms} - Item ${i + 1}`,
      price: Math.round(price * 100) / 100,
      currency: 'USD',
      condition: i % 2 === 0 ? 'Used' : 'New',
      url: `https://ebay.com/item-${i + 1}`,
      imageUrl: `https://picsum.photos/200/200?random=${i}`,
      endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const prices = mockItems.map(item => item.price);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve({
        success: true,
        averagePrice: Math.round(averagePrice * 100) / 100,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        },
        itemCount: mockItems.length,
        items: mockItems,
        lastUpdated: new Date().toISOString(),
        isMock: true // Flag to indicate this is mock data
      });
    }, 1000); // 1 second delay
  });
};

/**
 * Update market price for an item
 * @param {Object} item - Item object to update
 * @returns {Promise<Object>} Updated item with new market price
 */
export const updateItemMarketPrice = async (item) => {
  if (!item.ebay_search_terms || !item.ebay_search_terms.trim()) {
    throw new Error('No eBay search terms configured for this item');
  }

  try {
    const priceData = await searcheBayPrices(item.ebay_search_terms);
    
    if (!priceData.success) {
      throw new Error(priceData.error || 'Failed to get market price');
    }

    // Update price history
    const newPriceHistory = [
      ...(item.price_history || []),
      {
        price: priceData.averagePrice,
        date: new Date().toISOString(),
        source: 'ebay',
        priceRange: priceData.priceRange,
        itemCount: priceData.itemCount
      }
    ].slice(-50); // Keep last 50 price updates

    return {
      ...item,
      current_market_price: priceData.averagePrice,
      last_price_update: new Date().toISOString(),
      price_history: newPriceHistory,
      _priceData: priceData // Include full price data for debugging
    };

  } catch (error) {
    console.error('Error updating market price:', error);
    throw error;
  }
};

/**
 * Calculate investment performance for an item
 * @param {Object} item - Item with price tracking data
 * @returns {Object} Investment performance metrics
 */
export const calculateInvestmentPerformance = (item) => {
  const purchasePrice = parseFloat(item.purchase_price || item.price || 0);
  const currentMarketPrice = parseFloat(item.current_market_price || 0);
  
  if (!purchasePrice || !currentMarketPrice) {
    return {
      hasData: false,
      purchasePrice: purchasePrice || 0,
      currentPrice: currentMarketPrice || 0,
      difference: 0,
      percentChange: 0,
      status: 'unknown'
    };
  }

  const difference = currentMarketPrice - purchasePrice;
  const percentChange = (difference / purchasePrice) * 100;
  
  return {
    hasData: true,
    purchasePrice,
    currentPrice: currentMarketPrice,
    difference,
    percentChange,
    status: difference > 0 ? 'profit' : difference < 0 ? 'loss' : 'neutral',
    lastUpdated: item.last_price_update
  };
};

/**
 * Format currency value for display
 * @param {number} value - Numeric value to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (!value || isNaN(value)) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format percentage change for display
 * @param {number} percentChange - Percentage change value
 * @returns {string} Formatted percentage string with appropriate icon
 */
export const formatPercentChange = (percentChange) => {
  if (!percentChange || isNaN(percentChange)) return '';
  
  const formatted = Math.abs(percentChange).toFixed(1);
  const icon = percentChange > 0 ? '📈' : percentChange < 0 ? '📉' : '➖';
  const sign = percentChange > 0 ? '+' : '';
  
  return `${icon} ${sign}${percentChange.toFixed(1)}%`;
};

/**
 * Test function to verify eBay API connectivity
 * @param {string} testSearchTerms - Search terms to test with
 * @returns {Promise<Object>} Test results
 */
export const testEbayAPI = async (testSearchTerms = 'iPhone 13') => {
  console.log('🧪 Testing eBay API connection...');
  
  try {
    const startTime = Date.now();
    const result = await searcheBayPrices(testSearchTerms, { maxResults: 5 });
    const endTime = Date.now();
    
    return {
      success: true,
      responseTime: endTime - startTime,
      result,
      message: `✅ eBay API test successful! Found ${result.itemCount} items in ${endTime - startTime}ms`
    };
  } catch (error) {
    console.error('❌ eBay API test failed:', error);
    return {
      success: false,
      error: error.message,
      message: `❌ eBay API test failed: ${error.message}`
    };
  }
};