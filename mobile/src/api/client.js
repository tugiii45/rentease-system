import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HOST = 'rentease-backend-efjo.onrender.com';

const apiClient = axios.create({
  baseURL: `https://${HOST}/api`,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getWebSocketUrl = (threadId, token) => `wss://${HOST}/ws/chat/${threadId}/?token=${token}`;

export default apiClient;