import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import AddCollectionScreen from './src/screens/AddCollectionScreen';
import EditCollectionScreen from './src/screens/EditCollectionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#222' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
