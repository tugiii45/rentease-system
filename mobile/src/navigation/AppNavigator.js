import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import LandlordDashboardScreen from '../screens/landlord/DashboardScreen';
import TenantListScreen from '../screens/landlord/TenantListScreen';
import CreateTenantScreen from '../screens/landlord/CreateTenantScreen';
import CreatePropertyScreen from '../screens/landlord/CreatePropertyScreen';
import CreateUnitScreen from '../screens/landlord/CreateUnitScreen';
import TenantHomeScreen from '../screens/tenant/TenantHomeScreen';
import PayRentScreen from '../screens/tenant/PayRentScreen';
import MyIssuesScreen from '../screens/tenant/MyIssuesScreen';
import ReportIssueScreen from '../screens/tenant/ReportIssueScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { colors } from '../theme/theme';
import PostNoticeScreen from '../screens/landlord/PostNoticeScreen';
import ManageNoticesScreen from '../screens/landlord/ManageNoticesScreen';
import ManageIssuesScreen from '../screens/landlord/ManageIssuesScreen';
import ThreadListScreen from '../screens/ThreadListScreen';
import ChatScreen from '../screens/ChatScreen';
import NewThreadScreen from '../screens/landlord/NewThreadScreen';
import InvoiceListScreen from '../screens/landlord/InvoiceListScreen';
import AddChargesScreen from '../screens/landlord/AddChargesScreen';
import PropertyDetailScreen from '../screens/landlord/PropertyDetailScreen';
import EditUnitScreen from '../screens/landlord/EditUnitScreen';


const Stack = createNativeStackNavigator();

function ProfileButton({ navigation }) {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ paddingHorizontal: 8 }}>
      <Text style={{ color: colors.surface, fontFamily: 'Manrope_700Bold', fontSize: 14 }}>Profile</Text>
    </TouchableOpacity>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.surface,
          headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Rentease', headerShown: false }} />

        <Stack.Screen
          name="LandlordDashboard"
          component={LandlordDashboardScreen}
          options={({ navigation }) => ({ title: 'Dashboard', headerRight: () => <ProfileButton navigation={navigation} /> })}
        />
        <Stack.Screen name="TenantList" component={TenantListScreen} options={{ title: 'Units & Tenants' }} />
        <Stack.Screen name="CreateTenant" component={CreateTenantScreen} options={{ title: 'Add Tenant' }} />
        <Stack.Screen name="CreateProperty" component={CreatePropertyScreen} options={{ title: 'Add Property' }} />
        <Stack.Screen name="CreateUnit" component={CreateUnitScreen} options={{ title: 'Add Unit' }} />

        <Stack.Screen
          name="TenantHome"
          component={TenantHomeScreen}
          options={({ navigation }) => ({ title: 'Home', headerRight: () => <ProfileButton navigation={navigation} /> })}
        />
        <Stack.Screen name="PayRent" component={PayRentScreen} options={{ title: 'Pay Rent' }} />
        <Stack.Screen name="MyIssues" component={MyIssuesScreen} options={{ title: 'My Issues' }} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} options={{ title: 'Report an Issue' }} />

        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
        <Stack.Screen name="ManageNotices" component={ManageNoticesScreen} options={{ title: 'Notices' }} />
        <Stack.Screen name="PostNotice" component={PostNoticeScreen} options={{ title: 'Post Notice' }} />
        <Stack.Screen name="ManageIssues" component={ManageIssuesScreen} options={{ title: 'Manage Issues' }} />
        <Stack.Screen name="ThreadList" component={ThreadListScreen} options={{ title: 'Messages' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="NewThread" component={NewThreadScreen} options={{ title: 'New Conversation' }} />
        <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Invoices' }} />
        <Stack.Screen name="AddCharges" component={AddChargesScreen} options={{ title: 'Add Charges' }} />
        <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{title: 'Properties'}} />
        <Stack.Screen name="EditUnit" component={EditUnitScreen} options={{ title: 'Edit Unit' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}