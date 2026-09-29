import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import apiClient from '../api/client';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    return; // Push notifications don't work on simulators
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  try {
    await apiClient.post('/accounts/register-push-token/', { push_token: tokenData.data });
  } catch (error) {
    console.log('Failed to register push token:', error.message);
  }
}