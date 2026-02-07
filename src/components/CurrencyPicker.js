/**
 * CurrencyPicker Component
 * 
 * A reusable currency selection component with modal picker
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/theme';
import { getCurrencyList, CURRENCIES } from '../utils/currencyUtils';

const CurrencyPicker = ({ 
  selectedCurrency, 
  onCurrencyChange, 
  style,
  buttonStyle,
  textStyle 
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const currencyList = getCurrencyList();

  const selectedCurrencyData = CURRENCIES[selectedCurrency];

  const renderCurrencyItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border 
        },
        item.code === selectedCurrency && { backgroundColor: colors.primary + '20' }
      ]}
      onPress={() => {
        onCurrencyChange(item.code);
        setModalVisible(false);
      }}
    >
      <View style={styles.currencyItemContent}>
        <Text style={[
          styles.currencySymbol, 
          { color: colors.text },
          item.code === selectedCurrency && { color: colors.primary, fontWeight: 'bold' }
        ]}>
          {item.symbol}
        </Text>
        <View style={styles.currencyInfo}>
          <Text style={[
            styles.currencyCode, 
            { color: colors.text },
            item.code === selectedCurrency && { color: colors.primary, fontWeight: 'bold' }
          ]}>
            {item.code}
          </Text>
          <Text style={[
            styles.currencyName, 
            { color: colors.textSecondary },
            item.code === selectedCurrency && { color: colors.primary }
          ]}>
            {item.name}
          </Text>
        </View>
        {item.code === selectedCurrency && (
          <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border 
          },
          buttonStyle
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.pickerButtonText,
          { color: colors.text },
          textStyle
        ]}>
          {selectedCurrencyData ? 
            `${selectedCurrencyData.symbol} ${selectedCurrency}` : 
            'Select Currency'
          }
        </Text>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: colors.background }
          ]}>
            <View style={[
              styles.modalHeader,
              { borderBottomColor: colors.border }
            ]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Currency
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.danger }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={currencyList}
              renderItem={renderCurrencyItem}
              keyExtractor={item => item.code}
              style={styles.currencyList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    borderBottomWidth: 1,
  },
  currencyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CurrencyPicker;