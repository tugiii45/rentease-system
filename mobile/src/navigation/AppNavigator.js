import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TenantHomeScreen from '../screens/tenant/TenantHomeScreen';
import LoginScreen from '../screens/LoginScreen';
import LandlordDashboardScreen from '../screens/landlord/DashboardScreen';
import TenantListScreen from '../screens/landlord/TenantListScreen';
import CreateTenantScreen from '../screens/landlord/CreateTenantScreen';
import CreatePropertyScreen from '../screens/landlord/CreatePropertyScreen';
import CreateUnitScreen from '../screens/landlord/CreateUnitScreen';
import { colors } from '../theme/theme';
import PayRentScreen from '../screens/tenant/PayRentScreen';
import MyIssuesScreen from '../screens/tenant/MyIssuesScreen';
import ReportIssueScreen from '../screens/tenant/ReportIssueScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.surface,
          headerTitleStyle: { fontFamily: 'Manrope_700Bold' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Rentease', headerShown: false }} />
        <Stack.Screen name="LandlordDashboard" component={LandlordDashboardScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="TenantList" component={TenantListScreen} options={{ title: 'Units & Tenants' }} />
        <Stack.Screen name="CreateTenant" component={CreateTenantScreen} options={{ title: 'Add Tenant' }} />
        <Stack.Screen name="CreateProperty" component={CreatePropertyScreen} options={{ title: 'Add Property' }} />
        <Stack.Screen name="CreateUnit" component={CreateUnitScreen} options={{ title: 'Add Unit' }} />
        <Stack.Screen name="TenantHome" component={TenantHomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="PayRent" component={PayRentScreen} options={{ title: 'Pay Rent' }} />
        <Stack.Screen name="MyIssues" component={MyIssuesScreen} options={{ title: 'My Issues' }} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} options={{ title: 'Report an Issue' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}