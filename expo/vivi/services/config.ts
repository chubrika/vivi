import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the development server URL from Expo
const getDevelopmentServerUrl = () => {
  try {
    if (__DEV__ && Constants.expoConfig?.hostUri) {
      // Extract the IP address from the development server
      const hostUri = Constants.expoConfig.hostUri;
      const ipMatch = hostUri.match(/(\d+\.\d+\.\d+\.\d+):(\d+)/);
      
      if (ipMatch) {
        const [, ip, port] = ipMatch;
        // Use the same IP but port 5000 for the backend
        return `http://${ip}:5000`;
      }
    }
  } catch (error) {
    console.warn('Error getting development server URL:', error);
  }
  return null;
};

// Determine the API URL based on environment
const getApiUrl = () => {
  // For physical devices, always use production URL
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // Check if we're in development mode but on a physical device
    if (__DEV__) {
      // Try to use local network IP if available
      const devUrl = getDevelopmentServerUrl();
      if (devUrl) {
        console.log('Using development API URL for device:', devUrl);
        return devUrl;
      }
    }
    
    // Fallback to production URL for physical devices
    console.log('Using production API URL for device');
    return 'https://vivi-backend-ejes.onrender.com';
  }
  
  // For development (emulator/simulator), try local backend
  if (__DEV__) {
    const devUrl = getDevelopmentServerUrl();
    if (devUrl) {
      console.log('Using development API URL:', devUrl);
      return devUrl;
    }
    
    // Fallback to localhost if we can't determine the IP
    console.log('Using localhost API URL');
    return 'http://localhost:5000';
  }
  
  // For production builds, always use the deployed backend
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
  hostUri: Constants.expoConfig?.hostUri,
}); 