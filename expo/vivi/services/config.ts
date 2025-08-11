import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuration: Always use production API URL
// This ensures the app always connects to the production server
// regardless of development or production environment
const getApiUrl = () => {
  // Always use production URL regardless of environment or platform
  console.log('Using production API URL');
  return 'https://vivi-backend-ejes.onrender.com';
};

export const API_URL = `${getApiUrl()}/api`;

// Add CORS headers for mobile requests
export const getHeaders = (requireAuth = false, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (requireAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Log the current configuration
console.log('API Configuration:', {
  isDev: __DEV__,
  platform: Platform.OS,
  apiUrl: API_URL,
  message: 'Always using production server URL'
}); 