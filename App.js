import React, { useState, useCallback } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenLib from 'expo-splash-screen';

import { ThemeProvider, useTheme } from './src/theme/theme';
import SplashScreen from './src/components/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import AddCollectionScreen from './src/screens/AddCollectionScreen';
import EditCollectionScreen from './src/screens/EditCollectionScreen';
import DataExportScreen from './src/screens/DataExportScreen';

const Stack = createStackNavigator();

// Navigation component that uses the theme
function AppNavigator() {
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
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Collection"
          component={CollectionScreen}
          options={({ route }) => ({ title: route.params.collectionName })}
        />
        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Item' }} />
        <Stack.Screen name="EditItem" component={EditItemScreen} options={{ title: 'Edit Item' }} />
        <Stack.Screen name="AddCollection" component={AddCollectionScreen} options={{ title: 'Add Collection' }} />
        <Stack.Screen name="EditCollection" component={EditCollectionScreen} options={{ title: 'Edit Collection' }} />
        <Stack.Screen name="DataExport" component={DataExportScreen} options={{ title: 'Backup & Restore' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Main App component that provides the theme
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const onSplashFinish = useCallback(() => {
    setAppIsReady(true);
  }, []);

  return (
    <ThemeProvider>
      {!appIsReady ? (
        <SplashScreen onFinish={onSplashFinish} />
      ) : (
        <AppNavigator />
      )}
    </ThemeProvider>
  );
}
