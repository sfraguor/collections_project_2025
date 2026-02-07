/**
 * PriceInput Component
 * 
 * A specialized input component for entering prices with currency selection
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/theme';
import CurrencyPicker from './CurrencyPicker';
import { formatCurrency, parseCurrency, getUserCurrency, DEFAULT_CURRENCY, CURRENCIES } from '../utils/currencyUtils';

const PriceInput = ({
  value,
  onValueChange,
  currency,
  onCurrencyChange,
  placeholder = "Enter price",
  style,
  label,
  required = false,
  disabled = false,
  autoFocus = false,
}) => {
  const { colors } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency || DEFAULT_CURRENCY);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Initialize currency from user preference
  useEffect(() => {
    const initCurrency = async () => {
      if (!currency) {
        const userCurrency = await getUserCurrency();
        setSelectedCurrency(userCurrency);
        if (onCurrencyChange) {
          onCurrencyChange(userCurrency);
        }
      }
    };
    initCurrency();
  }, []);

  // Update input value when external value changes
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setInputValue(value.toString());
    } else {
      setInputValue('');
    }
  }, [value]);

  // Update currency when external currency changes
  useEffect(() => {
    if (currency && currency !== selectedCurrency) {
      setSelectedCurrency(currency);
    }
  }, [currency]);

  const handleTextChange = (text) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    // Prevent multiple decimal points
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }

    setInputValue(cleanedText);
    
    // Parse the number and notify parent
    const numericValue = parseFloat(cleanedText);
    if (onValueChange) {
      onValueChange(cleanedText === '' ? '' : (isNaN(numericValue) ? '' : numericValue));
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setSelectedCurrency(newCurrency);
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
    setShowCurrencyPicker(false);
  };

  const currencyData = CURRENCIES[selectedCurrency];
  const isPrefix = currencyData?.position === 'prefix';

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.danger }}>*</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        { 
          borderColor: colors.border,
          backgroundColor: disabled ? colors.border : colors.card,
        }
      ]}>
        {isPrefix && (
          <TouchableOpacity 
            style={[styles.currencyButton, styles.prefixButton]}
            onPress={() => !disabled && setShowCurrencyPicker(true)}
            disabled={disabled}
          >
            <Text style={[
              styles.currencyButtonText, 
              { color: disabled ? colors.textSecondary : colors.text }
            ]}>
              {currencyData?.symbol || '€'}
            </Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[
            styles.input,
            { 
              color: disabled ? colors.textSecondary : colors.text,
              flex: 1,
            }
          ]}
          value={inputValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="decimal-pad"
          editable={!disabled}
          autoFocus={autoFocus}
        />

        {!isPrefix && (
          <TouchableOpacity 
            style={[styles.currencyButton, styles.suffixButton]}
            onPress={() => !disabled && setShowCurrencyPicker(true)}
            disabled={disabled}
          >
            <Text style={[
              styles.currencyButtonText, 
              { color: disabled ? colors.textSecondary : colors.text }
            ]}>
              {currencyData?.symbol || '€'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showCurrencyPicker && (
        <CurrencyPicker
          selectedCurrency={selectedCurrency}
          onCurrencyChange={handleCurrencyChange}
          style={styles.currencyPickerOverlay}
        />
      )}

      {/* Quick currency buttons for common currencies */}
      <View style={styles.quickCurrencies}>
        {['EUR', 'USD', 'GBP'].map((curr) => (
          <TouchableOpacity
            key={curr}
            style={[
              styles.quickCurrencyButton,
              { 
                backgroundColor: selectedCurrency === curr ? colors.primary : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => handleCurrencyChange(curr)}
            disabled={disabled}
          >
            <Text style={[
              styles.quickCurrencyText,
              { 
                color: selectedCurrency === curr ? '#fff' : colors.text,
                opacity: disabled ? 0.5 : 1,
              }
            ]}>
              {CURRENCIES[curr]?.symbol} {curr}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Display formatted preview if value exists */}
      {inputValue && !isNaN(parseFloat(inputValue)) && (
        <Text style={[styles.preview, { color: colors.textSecondary }]}>
          Preview: {formatCurrency(parseFloat(inputValue), selectedCurrency)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlign: 'center',
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixButton: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  suffixButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  currencyButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  currencyPickerOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  quickCurrencies: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  quickCurrencyButton: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickCurrencyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  preview: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default PriceInput;