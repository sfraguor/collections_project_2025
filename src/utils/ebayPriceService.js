/**
 * eBay Finding API Service for Price Tracking
 * 
 * This service uses the eBay Finding API to get current market prices
 * for items based on search terms provided by users.
 * 
 * NOTE: You will need to register for eBay Developer account and get API keys:
 * https://developer.ebay.com/
 */
import { formatCurrency, DEFAULT_CURRENCY, CURRENCIES } from './currencyUtils';
import { getCachedPrice, cachePrice } from './priceCache';

// eBay Finding API Configuration
// Environment Configuration  
const EBAY_ENVIRONMENT = 'sandbox'; // 🧪 SANDBOX MODE - Switch to 'production' after getting eBay approval

// Emergency fallback mode - DISABLED to force real API debugging
const EMERGENCY_FALLBACK_MODE = false; 

// Temporary mode - DISABLED to work on real API fix
const TEMPORARY_MOCK_MODE = false;

// Debug mode for detailed logging
const DEBUG_MODE = true;

// API Keys
const EBAY_SANDBOX_APP_ID = 'SergioFr-Collecti-SBX-26e85ef25-c81e5fd3';
const EBAY_PRODUCTION_APP_ID = 'SergioFr-Collecti-PRD-36e4180bf-6f605e3e'; // ✅ PRODUCTION APP ID

// Choose the right configuration
const EBAY_APP_ID = EBAY_ENVIRONMENT === 'production' 
  ? EBAY_PRODUCTION_APP_ID 
  : EBAY_SANDBOX_APP_ID;

// API URLs differ between production and sandbox
const EBAY_FINDING_API_URL = EBAY_ENVIRONMENT === 'production'
  ? 'https://svcs.ebay.com/services/search/FindingService/v1'
  : 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1';

// Log current environment
console.log(`🏷️ eBay API Environment: ${EBAY_ENVIRONMENT.toUpperCase()}`);
console.log(`🔑 Using App ID: ${EBAY_APP_ID.substring(0, 10)}...`);

// Rate limiting variables
let lastApiCall = 0;
const MIN_CALL_INTERVAL = 60000; // 1 minute between calls (more reasonable)

// Track daily call count
let dailyCallCount = 0;
const MAX_DAILY_CALLS = 100; // Reasonable limit for production use (eBay allows 5000/day)
let lastResetDate = new Date().toDateString();

/**
 * Wait function for rate limiting
 * @param {number} ms - Milliseconds to wait
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function for API calls
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: wait longer after each failed attempt
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await wait(delay);
    }
  }
};

/**
 * Search eBay for items matching the given search terms
 * @param {string} searchTerms - Keywords to search for
 * @param {Object} options - Search options
 * @param {string} options.currency - Currency to filter by (EUR, USD, GBP, etc.)
 * @param {string} options.globalId - eBay site to search (EBAY-US, EBAY-ES, EBAY-GB, etc.)
 * @returns {Promise<Object>} Search results with price information
 */
export const searcheBayPrices = async (searchTerms, options = {}) => {
  if (!searchTerms || !searchTerms.trim()) {
    throw new Error('Search terms are required');
  }

  const currency = options.currency || DEFAULT_CURRENCY;
  
  // 🚀 FIRST: Try to get cached data
  const cachedData = await getCachedPrice(searchTerms, currency);
  if (cachedData) {
    return cachedData;
  }

  // Rate limiting: ensure we don't call too frequently
  const now = Date.now();
  const today = new Date().toDateString();
  
  // Reset daily counter if new day
  if (today !== lastResetDate) {
    dailyCallCount = 0;
    lastResetDate = today;
  }
  
  // Check daily limit - if exceeded, show clear message
  if (dailyCallCount >= MAX_DAILY_CALLS) {
    const resetTime = new Date();
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);
    
    throw new Error(`🚫 eBay API Daily Limit Reached (${MAX_DAILY_CALLS} calls/day)\n\n⏰ Quota resets at: ${resetTime.toLocaleString()}\n\n💡 This is normal for new eBay applications. Options:\n1. Wait for quota reset (24 hours)\n2. Request production access in eBay Developer Console\n3. Use cached prices when available`);
  }
  
  // Check time-based rate limit
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < MIN_CALL_INTERVAL) {
    const waitTime = MIN_CALL_INTERVAL - timeSinceLastCall;
    const waitMinutes = Math.ceil(waitTime / 60000);
    
    throw new Error(`⏳ eBay API Rate Limited\n\nPlease wait ${waitMinutes} minutes before next call.\n\n🔄 This prevents hitting daily limits too quickly.\n💡 New eBay apps have strict rate limits (${MAX_DAILY_CALLS} calls/day)`);
  }
  
  lastApiCall = now;
  dailyCallCount++;

  // Currency and site mapping for eBay
  const currencyToSite = {
    'USD': 'EBAY-US',
    'EUR': 'EBAY-ES', // Spain for Euro
    'GBP': 'EBAY-GB',
    'CAD': 'EBAY-CA',
    'JPY': 'EBAY-JP',
    'CHF': 'EBAY-CH'
  };

  const globalId = options.globalId || currencyToSite[currency] || 'EBAY-US';

  console.log(`🛒 Searching eBay: "${searchTerms}" in ${currency} on ${globalId}`);
  
  if (DEBUG_MODE) {
    console.log('🔧 DEBUG INFO:');
    console.log('- Environment:', EBAY_ENVIRONMENT);
    console.log('- App ID:', EBAY_APP_ID ? EBAY_APP_ID.substring(0, 20) + '...' : 'NOT SET');
    console.log('- API URL:', EBAY_FINDING_API_URL);
    console.log('- Search Terms:', searchTerms);
    console.log('- Currency:', currency);
    console.log('- Global ID:', globalId);
  }

  // Check if using real API or missing credentials
  const isUsingMockData = EBAY_APP_ID === 'YOUR_EBAY_APP_ID';
  
  if (isUsingMockData) {
    throw new Error('❌ eBay API credentials not configured. Please set up your eBay App ID.');
  }

  // Use retry logic for the API call - but fail clearly if authentication is wrong
  try {
    const result = await retryWithBackoff(async () => {
      return await performeBayAPICall(searchTerms, currency, globalId, options);
    }, 3, 2000);
    
    // Cache successful result
    await cachePrice(searchTerms, currency, result);
    return result;
    
  } catch (error) {
    console.error('❌ eBay API FAILED:', error.message);
    
    // Check if this is an authentication error (don't use fallback for this)
    if (error.message.includes('11002') || error.message.includes('Invalid Application')) {
      throw new Error(`🔑 eBay API Authentication Error: ${error.message}\n\n🛠️ Fix Required:\n1. Check eBay Developer Console\n2. Verify App ID is active\n3. Regenerate credentials if needed`);
    }
    
    // For other errors, also fail clearly (no automatic fallback)
    throw new Error(`🌐 eBay API Error: ${error.message}\n\nThis needs to be fixed before price tracking can work.`);
  }
};

/**
 * Perform the actual eBay API call
 * @param {string} searchTerms - Search terms
 * @param {string} currency - Currency
 * @param {string} globalId - Global ID
 * @param {Object} options - Options
 */
const performeBayAPICall = async (searchTerms, currency, globalId, options) => {
  try {
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'GLOBAL-ID': globalId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': searchTerms,
      'paginationInput.entriesPerPage': Math.min(options.maxResults || 10, 20), // Limit to max 20
      'sortOrder': options.sortOrder || 'PricePlusShipping', // Sort by price
      'itemFilter(0).name': 'Condition',
      'itemFilter(0).value(0)': 'New',
      'itemFilter(0).value(1)': 'Used',
      'itemFilter(1).name': 'MinPrice',
      'itemFilter(1).value': '1', // Min price to avoid $0 listings
      'itemFilter(1).paramName': 'Currency',
      'itemFilter(1).paramValue': currency,
      'itemFilter(2).name': 'ListingType',
      'itemFilter(2).value(0)': 'FixedPrice',
      'itemFilter(2).value(1)': 'AuctionWithBIN'
    });

    console.log(`🌐 Requesting eBay API: ${EBAY_FINDING_API_URL}`);
    
    if (DEBUG_MODE) {
      console.log('🔧 Request Parameters:');
      console.log('- Operation:', 'findItemsByKeywords');
      console.log('- Security App Name:', EBAY_APP_ID ? 'SET' : 'NOT SET');
      console.log('- Global ID:', globalId);
      console.log('- Keywords:', searchTerms);
      console.log('- Max Results:', Math.min(options.maxResults || 10, 20));
    }

    const response = await fetch(`${EBAY_FINDING_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CollectionsApp/1.0.0',
        'Accept': 'application/json',
      },
      // Add timeout
      timeout: 15000
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ eBay API HTTP Error:', response.status, response.statusText);
      console.error('❌ Error details:', errorText);
      console.error('❌ Request URL was:', `${EBAY_FINDING_API_URL}?${params.toString()}`);
      
      // Handle specific error codes
      if (response.status === 500) {
        console.error('🚨 eBay API 500 Error Analysis:');
        console.error('- This usually indicates eBay server issues');
        console.error('- Could be temporary overload or maintenance'); 
        console.error('- Could be invalid parameters in the request');
        console.error('- App ID might have issues or be suspended');
        
        // Try a simpler request to test if it's a parameter issue
        console.log('🔧 Testing with simplified parameters...');
        
        throw new Error(`eBay API server error (500). Server issue detected. Check: 1) eBay server status, 2) App ID validity, 3) Request parameters. Error: ${errorText}`);
      } else if (response.status === 403) {
        console.error('🚨 eBay API 403 Error - Access Denied');
        console.error('- Check if App ID is valid and active');
        console.error('- Verify production vs sandbox environment');
        console.error('- Check if account has necessary permissions');
        throw new Error(`eBay API access denied (403). Check your API credentials and permissions.`);
      } else if (response.status === 429) {
        console.error('🚨 eBay API 429 Error - Rate Limit');
        console.error('- Too many requests sent');
        console.error('- Wait before retrying');
        throw new Error(`eBay API rate limit exceeded (429). Please wait before trying again.`);
      } else {
        throw new Error(`eBay API HTTP error: ${response.status} - ${response.statusText}. Details: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('✅ eBay API Response received');
    
    // Check for API-level errors
    if (data.findItemsByKeywordsResponse?.[0]?.ack?.[0] === 'Failure') {
      const errorMessage = data.findItemsByKeywordsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0];
      const errorId = data.findItemsByKeywordsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.errorId?.[0];
      
      // Handle rate limiting specifically
      if (errorId === '10001') {
        throw new Error('eBay API rate limit exceeded. Please wait at least 1 minute before trying again.');
      }
      
      throw new Error(`eBay API Error (${errorId}): ${errorMessage || 'Unknown error'}`);
    }
    
    // Check for error response structure
    if (data.errorMessage) {
      const errorMessage = data.errorMessage?.[0]?.error?.[0]?.message?.[0];
      const errorId = data.errorMessage?.[0]?.error?.[0]?.errorId?.[0];
      
      if (errorId === '10001') {
        throw new Error('eBay API rate limit exceeded. Please wait at least 1 minute before trying again.');
      }
      
      throw new Error(`eBay API Error (${errorId}): ${errorMessage || 'Unknown error'}`);
    }
    
    return parseEbayResponse(data, searchTerms, currency);

  } catch (error) {
    console.error('eBay API Error:', error);
    throw new Error(`Failed to fetch eBay prices: ${error.message}`);
  }
};

/**
 * Parse eBay Finding API response to extract price information
 * @param {Object} ebayResponse - Raw eBay API response
 * @param {string} searchTerms - Original search terms
 * @param {string} currency - Currency for the search
 * @returns {Object} Parsed price data
 */
const parseEbayResponse = (ebayResponse, searchTerms, currency) => {
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
      source: 'ebay-api',
      timestamp: new Date().toISOString(),
      averagePrice: Math.round(averagePrice * 100) / 100,
      priceRange: {
        min: Math.round(minPrice * 100) / 100,
        max: Math.round(maxPrice * 100) / 100
      },
      itemCount: items.length,
      items: items.slice(0, 5), // Return top 5 items
      currency: items[0].currency, // Use currency from first item
      searchTerms: searchTerms, // Include original search terms
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
 * @param {string} currency - Currency for mock prices
 * @returns {Object} Mock price data
 */
const mockEbayResponse = (searchTerms, currency = 'USD') => {
  console.log(`🎭 Using INTELLIGENT mock eBay data for: "${searchTerms}" in ${currency}`);
  
  // Enhanced price estimation based on search terms and categories
  let basePrice = 100; // Default
  let category = 'general';
  
  const lowerTerms = searchTerms.toLowerCase();
  
  // Japanese collectibles (Kokeshi, figurines, etc.)
  if (lowerTerms.includes('kokeshi') || lowerTerms.includes('japanese') || lowerTerms.includes('japan')) {
    category = 'japanese-collectibles';
    if (lowerTerms.includes('vintage') || lowerTerms.includes('antique')) {
      basePrice = Math.random() * 150 + 80; // 80-230
    } else {
      basePrice = Math.random() * 80 + 40; // 40-120
    }
  }
  // Artist names (Junichi Sasamori, etc.)
  else if (lowerTerms.includes('sasamori') || lowerTerms.includes('junichi')) {
    category = 'artist-collectibles';
    basePrice = Math.random() * 120 + 60; // 60-180
  }
  // Electronics
  else if (lowerTerms.includes('iphone') || lowerTerms.includes('phone')) {
    category = 'electronics';
    basePrice = Math.random() * 400 + 400; // 400-800
  }
  else if (lowerTerms.includes('laptop') || lowerTerms.includes('computer')) {
    category = 'electronics';
    basePrice = Math.random() * 800 + 600; // 600-1400
  }
  else if (lowerTerms.includes('watch') || lowerTerms.includes('reloj')) {
    category = 'accessories';
    basePrice = Math.random() * 300 + 100; // 100-400
  }
  // Trading cards
  else if (lowerTerms.includes('card') || lowerTerms.includes('pokemon') || lowerTerms.includes('trading')) {
    category = 'trading-cards';
    basePrice = Math.random() * 100 + 20; // 20-120
  }
  // Default collectibles
  else if (lowerTerms.includes('collectible') || lowerTerms.includes('vintage') || lowerTerms.includes('rare')) {
    category = 'collectibles';
    basePrice = Math.random() * 200 + 50; // 50-250
  }

  // Adjust prices for currency (approximate conversion rates)
  const currencyMultiplier = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'CAD': 1.35,
    'JPY': 149,
    'CHF': 0.88
  };

  const multiplier = currencyMultiplier[currency] || 1;
  const adjustedBasePrice = basePrice * multiplier;

  // Generate realistic item variations
  const mockItems = [];
  const itemCount = Math.floor(Math.random() * 8) + 3; // 3-10 items
  
  for (let i = 0; i < itemCount; i++) {
    const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
    const price = adjustedBasePrice + (adjustedBasePrice * variation);
    const condition = Math.random() > 0.3 ? 'Used' : 'New';
    
    // Generate realistic titles based on category
    let title = searchTerms;
    switch (category) {
      case 'japanese-collectibles':
        title = `${searchTerms} Japanese Traditional Doll ${condition === 'New' ? 'Mint' : 'Vintage'} ${i + 1}`;
        break;
      case 'artist-collectibles':
        title = `${searchTerms} Artist Collectible Figure ${condition} Edition ${i + 1}`;
        break;
      case 'electronics':
        title = `${searchTerms} ${condition} ${Math.random() > 0.5 ? 'Unlocked' : 'Factory'} Model ${i + 1}`;
        break;
      default:
        title = `${searchTerms} ${condition} Collectible Item ${i + 1}`;
    }
    
    mockItems.push({
      title: title.substring(0, 80), // eBay title length limit
      price: Math.round(price * 100) / 100,
      currency: currency,
      condition: condition,
      url: `https://ebay.com/itm/mock-${category}-${i + 1}`,
      imageUrl: `https://picsum.photos/200/200?random=${searchTerms.length + i}`,
      endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const prices = mockItems.map(item => item.price);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return new Promise((resolve) => {
    // Simulate realistic API delay
    setTimeout(() => {
      resolve({
        success: true,
        source: 'mock-intelligent',
        timestamp: new Date().toISOString(),
        searchTerms: searchTerms,
        currency: currency,
        category: category,
        averagePrice: Math.round(averagePrice * 100) / 100,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        },
        itemCount: mockItems.length,
        items: mockItems,
        lastUpdated: new Date().toISOString(),
        isMock: true,
        note: 'Datos inteligentes simulados - Basados en categoría y términos de búsqueda'
      });
    }, 800 + Math.random() * 400); // 0.8-1.2 second delay
  });
};

/**
 * Update market price for an item
 * @param {Object} item - Item object to update
 * @param {string} preferredCurrency - Preferred currency for price updates
 * @returns {Promise<Object>} Updated item with new market price
 */
export const updateItemMarketPrice = async (item, preferredCurrency = DEFAULT_CURRENCY) => {
  if (!item.ebay_search_terms || !item.ebay_search_terms.trim()) {
    throw new Error('No eBay search terms configured for this item');
  }

  try {
    // Use item's currency or preferred currency
    const searchCurrency = item.currency || preferredCurrency;
    
    const priceData = await searcheBayPrices(item.ebay_search_terms, {
      currency: searchCurrency
    });
    
    if (!priceData.success) {
      throw new Error(priceData.error || 'Failed to get market price');
    }

    // Update price history
    const newPriceHistory = [
      ...(item.price_history || []),
      {
        price: priceData.averagePrice,
        currency: searchCurrency,
        date: new Date().toISOString(),
        source: 'ebay',
        priceRange: priceData.priceRange,
        itemCount: priceData.itemCount
      }
    ].slice(-50); // Keep last 50 price updates

    return {
      ...item,
      current_market_price: priceData.averagePrice,
      current_market_currency: searchCurrency,
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
  
  // Get currencies
  const purchaseCurrency = item.purchase_currency || item.currency || DEFAULT_CURRENCY;
  const marketCurrency = item.current_market_currency || item.currency || DEFAULT_CURRENCY;
  
  if (!purchasePrice || !currentMarketPrice) {
    return {
      hasData: false,
      purchasePrice: purchasePrice || 0,
      purchaseCurrency,
      currentPrice: currentMarketPrice || 0,
      marketCurrency,
      difference: 0,
      percentChange: 0,
      status: 'unknown',
      currencyMismatch: purchaseCurrency !== marketCurrency
    };
  }

  // Note: In a real app, you'd want to convert currencies if they differ
  // For now, we'll just note the mismatch
  const difference = currentMarketPrice - purchasePrice;
  const percentChange = (difference / purchasePrice) * 100;
  
  return {
    hasData: true,
    purchasePrice,
    purchaseCurrency,
    currentPrice: currentMarketPrice,
    marketCurrency,
    difference,
    percentChange,
    status: difference > 0 ? 'profit' : difference < 0 ? 'loss' : 'neutral',
    lastUpdated: item.last_price_update,
    currencyMismatch: purchaseCurrency !== marketCurrency
  };
};

// Re-export formatCurrency and other utilities from currencyUtils
export { formatCurrency, formatPercentChange } from './currencyUtils';

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

/**
 * Diagnose eBay API production issues specifically
 */
export const diagnoseProductionIssues = async () => {
  console.log('� DIAGNOSING EBAY PRODUCTION API ISSUES');
  console.log('========================================');
  
  console.log('📋 Current Configuration:');
  console.log('- Environment:', EBAY_ENVIRONMENT);
  console.log('- Production App ID:', EBAY_PRODUCTION_APP_ID);
  console.log('- API Endpoint:', EBAY_FINDING_API_URL);
  
  // Test 1: Simple connectivity to eBay servers
  console.log('\n🌐 Testing eBay Server Connectivity...');
  try {
    const pingResponse = await fetch('https://svcs.ebay.com/services/search/FindingService/v1');
    console.log('✅ eBay servers are reachable');
    console.log('- Response status:', pingResponse.status);
  } catch (error) {
    console.log('❌ Cannot reach eBay servers');
    console.log('- Error:', error.message);
    return { connectivity: false, error: error.message };
  }
  
  // Test 2: Minimal API call to test authentication
  console.log('\n🔑 Testing App ID Authentication...');
  const testParams = new URLSearchParams({
    'OPERATION-NAME': 'findItemsByKeywords',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': EBAY_PRODUCTION_APP_ID,
    'GLOBAL-ID': 'EBAY-US',
    'RESPONSE-DATA-FORMAT': 'JSON',
    'keywords': 'test'
  });
  
  try {
    const authResponse = await fetch(`${EBAY_FINDING_API_URL}?${testParams.toString()}`);
    const authText = await authResponse.text();
    
    console.log('- Response Status:', authResponse.status);
    
    if (authResponse.status === 500) {
      try {
        const errorData = JSON.parse(authText);
        const errorId = errorData?.errorMessage?.[0]?.error?.[0]?.errorId?.[0];
        const errorMsg = errorData?.errorMessage?.[0]?.error?.[0]?.message?.[0];
        
        console.log('❌ Authentication Error Details:');
        console.log('- Error ID:', errorId);
        console.log('- Error Message:', errorMsg);
        
        if (errorId === '11002') {
          console.log('\n🚨 SPECIFIC ISSUE IDENTIFIED:');
          console.log('- Error 11002: Invalid Application');
          console.log('- This means your App ID is not valid/active');
          console.log('\n🛠️ REQUIRED ACTIONS:');
          console.log('1. Go to https://developer.ebay.com/my/applications');
          console.log('2. Check if your app is "Active" (not suspended)');
          console.log('3. Verify the App ID matches exactly');
          console.log('4. If suspended, contact eBay Developer Support');
          console.log('5. You may need to re-generate App ID');
          
          return { 
            connectivity: true, 
            authentication: false, 
            errorId, 
            errorMsg,
            solution: 'App ID invalid or suspended - check eBay Developer Console'
          };
        }
        
      } catch (parseError) {
        console.log('❌ Could not parse error response');
      }
    } else if (authResponse.status === 200) {
      console.log('✅ App ID authentication successful!');
      return { connectivity: true, authentication: true };
    }
    
  } catch (error) {
    console.log('❌ Authentication test failed');
    console.log('- Error:', error.message);
    return { connectivity: true, authentication: false, error: error.message };
  }
  
  console.log('\n📋 Diagnosis complete - check console for details');
};

/**
 * Get current eBay API quota status
 */
export const getQuotaStatus = () => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyCallCount = 0;
    lastResetDate = today;
  }
  
  const remaining = Math.max(0, MAX_DAILY_CALLS - dailyCallCount);
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);
  
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  const timeUntilNextCall = Math.max(0, MIN_CALL_INTERVAL - timeSinceLastCall);
  
  return {
    daily: {
      used: dailyCallCount,
      remaining: remaining,
      total: MAX_DAILY_CALLS,
      resetTime: resetTime.toLocaleString()
    },
    rateLimiting: {
      canCallNow: timeUntilNextCall === 0 && remaining > 0,
      timeUntilNextCall: timeUntilNextCall,
      minutesUntilNextCall: Math.ceil(timeUntilNextCall / 60000)
    }
  };
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.diagnoseProductionIssues = diagnoseProductionIssues;
  window.getQuotaStatus = getQuotaStatus;
}
