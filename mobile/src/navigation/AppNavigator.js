import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import LandlordDashboardScreen from '../screens/landlord/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Rentease Login' }} />
        <Stack.Screen name="LandlordDashboard" component={LandlordDashboardScreen} options={{ title: 'Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}