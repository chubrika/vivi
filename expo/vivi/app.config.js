export default {
  name: 'vivi',
  slug: 'vivi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash-icon.png',
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
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    // Allow cleartext traffic for development
    usesCleartextTraffic: true,
    package: "com.mycompany.vivi",
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE"
    ]
  },
  web: {
    favicon: './assets/images/favicon.png',
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
    "eas": {
      "projectId": "a554a96f-dc38-4896-9ecb-1b76cf4a4178"
    }
  },
  // Configure development server
  developmentClient: {
    silentLaunch: true,
  }
}; 