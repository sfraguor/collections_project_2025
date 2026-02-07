/**
 * Currency Utilities
 * 
 * Provides currency formatting, conversion, and management functionality
 */

// Supported currencies
export const CURRENCIES = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'suffix', // €100 or 100€
    decimals: 2,
    locale: 'es-ES' // Spanish locale for Euro formatting
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'prefix', // $100
    decimals: 2,
    locale: 'en-US'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'prefix', // £100
    decimals: 2,
    locale: 'en-GB'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    position: 'prefix', // ¥100
    decimals: 0, // Yen doesn't use decimals
    locale: 'ja-JP'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    position: 'prefix', // C$100
    decimals: 2,
    locale: 'en-CA'
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    position: 'suffix', // 100 CHF
    decimals: 2,
    locale: 'de-CH'
  }
};

// Default currency (can be changed by user preferences)
export const DEFAULT_CURRENCY = 'EUR';

/**
 * Format a number as currency
 * @param {number|string} amount - The amount to format
 * @param {string} currencyCode - The currency code (EUR, USD, etc.)
 * @param {boolean} compact - Whether to show compact format (1K instead of 1,000)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, compact = false) {
  if (!amount && amount !== 0) {
    return '-';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '-';
  }

  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

  try {
    let formattedAmount;

    if (compact && Math.abs(numAmount) >= 1000) {
      // Compact format for large numbers
      const formatter = new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
        notation: 'compact',
        maximumFractionDigits: 1
      });
      formattedAmount = formatter.format(numAmount);
    } else {
      // Standard format
      const formatter = new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals
      });
      formattedAmount = formatter.format(numAmount);
    }

    return formattedAmount;
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const roundedAmount = Math.round(numAmount * Math.pow(10, currency.decimals)) / Math.pow(10, currency.decimals);
    
    if (currency.position === 'prefix') {
      return `${currency.symbol}${roundedAmount.toFixed(currency.decimals)}`;
    } else {
      return `${roundedAmount.toFixed(currency.decimals)}${currency.symbol}`;
    }
  }
}

/**
 * Parse a formatted currency string back to a number
 * @param {string} formattedAmount - The formatted currency string
 * @param {string} currencyCode - The currency code
 * @returns {number|null} The parsed number or null if invalid
 */
export function parseCurrency(formattedAmount, currencyCode = DEFAULT_CURRENCY) {
  if (!formattedAmount || typeof formattedAmount !== 'string') {
    return null;
  }

  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  
  // Remove currency symbol and spaces
  let cleaned = formattedAmount
    .replace(currency.symbol, '')
    .replace(/[\s,]/g, '')
    .trim();

  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
}

/**
 * Format percentage change
 * @param {number} change - The percentage change
 * @returns {string} Formatted percentage with appropriate color indicators
 */
export function formatPercentChange(change) {
  if (!change && change !== 0) return '-';
  
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Get currency list for dropdowns/pickers
 * @returns {Array} Array of currency objects
 */
export function getCurrencyList() {
  return Object.values(CURRENCIES).map(currency => ({
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    displayName: `${currency.code} (${currency.symbol}) - ${currency.name}`
  }));
}

/**
 * Validate if a currency code is supported
 * @param {string} currencyCode - Currency code to validate
 * @returns {boolean} Whether the currency is supported
 */
export function isValidCurrency(currencyCode) {
  return currencyCode && CURRENCIES.hasOwnProperty(currencyCode);
}

/**
 * Get user's preferred currency from storage or use default
 * @returns {string} Currency code
 */
export async function getUserCurrency() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const storedCurrency = await AsyncStorage.getItem('user_preferred_currency');
    return storedCurrency && isValidCurrency(storedCurrency) ? storedCurrency : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Save user's preferred currency
 * @param {string} currencyCode - Currency code to save
 */
export async function saveUserCurrency(currencyCode) {
  if (!isValidCurrency(currencyCode)) {
    throw new Error('Invalid currency code');
  }

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('user_preferred_currency', currencyCode);
  } catch (error) {
    console.warn('Failed to save user currency preference:', error);
  }
}

/**
 * Convert amount with currency info for display
 * @param {number|string} amount - The amount
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency (optional, uses user preference)
 * @returns {Object} Converted amount info
 */
export function convertCurrencyDisplay(amount, fromCurrency, toCurrency = null) {
  const targetCurrency = toCurrency || DEFAULT_CURRENCY;
  
  // For now, we don't do real-time conversion (would need exchange rate API)
  // Just format in the requested currency
  if (fromCurrency === targetCurrency) {
    return {
      amount: formatCurrency(amount, fromCurrency),
      currency: fromCurrency,
      isConverted: false
    };
  }

  // If currencies differ, show original with note
  return {
    amount: formatCurrency(amount, fromCurrency),
    currency: fromCurrency,
    isConverted: false,
    note: `Originally in ${fromCurrency}`
  };
}

export default {
  formatCurrency,
  parseCurrency,
  formatPercentChange,
  getCurrencyList,
  isValidCurrency,
  getUserCurrency,
  saveUserCurrency,
  convertCurrencyDisplay,
  CURRENCIES,
  DEFAULT_CURRENCY
};