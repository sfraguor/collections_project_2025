// src/theme/theme.js
import { useColorScheme } from 'react-native';
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define our color palettes - Modern UI colors
const lightColors = {
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#F43F5E', // Rose
  secondaryDark: '#E11D48',
  secondaryLight: '#FB7185',
  accent: '#8B5CF6', // Purple
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981', // Emerald
  danger: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  gold: '#FFD700', // Gold for high value items
  goldDark: '#FFA500', // Dark gold
  goldLight: '#FFFACD', // Light gold
  disabled: '#D1D5DB',
  placeholder: '#9CA3AF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardGradientStart: '#FFFFFF',
  cardGradientEnd: '#F3F4F6',
};

const darkColors = {
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#F43F5E', // Rose
  secondaryDark: '#E11D48',
  secondaryLight: '#FB7185',
  accent: '#8B5CF6', // Purple
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textLight: '#9CA3AF',
  border: '#374151',
  success: '#10B981', // Emerald
  danger: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  gold: '#FFD700', // Gold for high value items
  goldDark: '#FFA500', // Dark gold
  goldLight: '#B8860B', // Dark gold brown for dark theme
  disabled: '#4B5563',
  placeholder: '#6B7280',
  overlay: 'rgba(0, 0, 0, 0.7)',
  cardGradientStart: '#1F2937',
  cardGradientEnd: '#111827',
};

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          // Use device theme if no saved preference
          setTheme(deviceTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  // Save theme preference when it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('theme', theme);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };

    if (!isLoading) {
      saveTheme();
    }
  }, [theme, isLoading]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Get the current colors based on theme
  const colors = theme === 'dark' ? darkColors : lightColors;

  // Common styles that can be used across the app - Modern UI styles
  const styles = {
    shadow: {
      shadowColor: colors.text,
      shadowOpacity: theme === 'dark' ? 0.5 : 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      ...{
        shadowColor: colors.text,
        shadowOpacity: theme === 'dark' ? 0.5 : 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      },
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    text: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    textSecondary: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    input: {
      backgroundColor: theme === 'dark' ? '#374151' : colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      fontSize: 16,
      color: colors.text,
      shadowColor: colors.text,
      shadowOpacity: theme === 'dark' ? 0.1 : 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      shadowColor: colors.primaryDark,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 13,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    buttonSecondaryText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    fab: {
      position: 'absolute',
      bottom: 32,
      right: 20,
      backgroundColor: colors.primary,
      borderRadius: 28,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: colors.primaryDark,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    fabText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 24,
    },
    // New modern styles
    cardGradient: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      marginRight: 8,
      marginBottom: 8,
    },
    pillText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 16,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, styles, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
