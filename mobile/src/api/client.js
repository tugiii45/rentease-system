import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HOST = '192.168.100.5:8000';

const apiClient = axios.create({
  baseURL: `http://${HOST}/api`,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getWebSocketUrl = (threadId, token) => `ws://${HOST}/ws/chat/${threadId}/?token=${token}`;

export default apiClient;