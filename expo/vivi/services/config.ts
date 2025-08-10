import Constants from 'expo-constants';

// Get the development server URL from Expo
const getDevelopmentServerUrl = () => {
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
  return null;
};

// Determine the API URL based on environment
const getApiUrl = () => {
  // For development, try to use local backend
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
  
  // For production, use the deployed backend
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
  apiUrl: API_URL,
  hostUri: Constants.expoConfig?.hostUri,
}); 