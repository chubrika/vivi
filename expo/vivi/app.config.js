export default {
  name: 'vivi',
  slug: 'vivi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    // Allow cleartext traffic for development
    usesCleartextTraffic: true,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    proxy: {
      '/api': {
        target: 'https://vivi-backend-ejes.onrender.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  },
  // Add network configuration for development
  extra: {
    apiUrl: process.env.API_URL || 'https://vivi-backend-ejes.onrender.com',
  },
  // Configure development server
  developmentClient: {
    silentLaunch: true,
  }
}; 