// src/components/ThemeToggle.js
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/theme';

/**
 * A component for toggling between light and dark themes
 * @param {Object} props - Component props
 * @param {Object} props.containerStyle - Additional styles for the container
 */
export default function ThemeToggle({ containerStyle }) {
  const { theme, colors, toggleTheme } = useTheme();
  
  return (
    <LinearGradient
      colors={[colors.cardGradientStart, colors.cardGradientEnd]}
      style={[styles.gradientContainer, containerStyle]}
    >
      <View style={[styles.container, { borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: colors.primaryLight }}
          thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
