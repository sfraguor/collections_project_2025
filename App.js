import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenLib from 'expo-splash-screen';
import { initializeCloudSync } from './src/utils/cloudSync';

import { ThemeProvider, useTheme } from './src/theme/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import AddCollectionScreen from './src/screens/AddCollectionScreen';
import EditCollectionScreen from './src/screens/EditCollectionScreen';
import DataExportScreen from './src/screens/DataExportScreen';
import CloudSyncScreen from './src/screens/CloudSyncScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ProfileScreen from './src/screens/auth/ProfileScreen';

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

// Auth navigation stack for unauthenticated users
function AuthNavigator() {
  const { theme, colors } = useTheme();
  
  // Customize navigation theme based on our app theme
  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.primary,
      text: '#fff',
      border: colors.border,
    },
  };

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.primary,
          height: 100,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
        },
        headerTintColor: '#fff',
        headerTitleStyle: { 
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 0.5,
        },
        headerTitleAlign: 'center',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
    </AuthStack.Navigator>
  );
}

// Main app navigation stack for authenticated users
function MainAppNavigator() {
  const { theme, colors } = useTheme();
  
  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.primary,
          height: 100,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
        },
        headerTintColor: '#fff',
        headerTitleStyle: { 
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 0.5,
        },
        headerTitleAlign: 'center',
      }}
    >
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen
        name="Collection"
        component={CollectionScreen}
        options={({ route }) => ({ title: route.params.collectionName })}
      />
      <AppStack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Item' }} />
      <AppStack.Screen name="EditItem" component={EditItemScreen} options={{ title: 'Edit Item' }} />
      <AppStack.Screen name="AddCollection" component={AddCollectionScreen} options={{ title: 'Add Collection' }} />
      <AppStack.Screen name="EditCollection" component={EditCollectionScreen} options={{ title: 'Edit Collection' }} />
      <AppStack.Screen name="DataExport" component={DataExportScreen} options={{ title: 'Backup & Restore' }} />
      <AppStack.Screen name="CloudSync" component={CloudSyncScreen} options={{ title: 'Cloud Sync' }} />
      <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Your Profile' }} />
    </AppStack.Navigator>
  );
}

// Root navigation component that decides which stack to show based on auth state
function RootNavigator() {
  const { theme, colors } = useTheme();
  const { user, loading } = useAuth();
  
  // Customize navigation theme based on our app theme
  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.primary,
      text: '#fff',
      border: colors.border,
    },
  };

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <SplashScreen onFinish={() => {}} />
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {user ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Main App component that provides the theme and auth context
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize cloud sync when app starts
  useEffect(() => {
    const setupCloudSync = async () => {
      try {
        const result = await initializeCloudSync();
        if (result.success) {
          console.log('Cloud sync initialized successfully');
        } else if (result.needsMigration) {
          console.log('Cloud sync needs database migration');
          // This is handled in the CloudSyncScreen
        } else if (result.message) {
          console.warn(`Cloud sync initialization issue: ${result.message}`);
        }
      } catch (error) {
        console.error('Failed to initialize cloud sync:', error);
      }
    };

    setupCloudSync();
  }, []);

  const onSplashFinish = useCallback(() => {
    setAppIsReady(true);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {!appIsReady ? (
          <SplashScreen onFinish={onSplashFinish} />
        ) : (
          <RootNavigator />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}
