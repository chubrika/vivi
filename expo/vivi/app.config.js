export default {
  name: 'vivi',
  slug: 'vivi',
  scheme: 'vivi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    edgeToEdgeEnabled: true,
    package: 'com.mycompany.vivi',
    versionCode: 1,
    permissions: ['INTERNET', 'ACCESS_NETWORK_STATE']
  },
  web: {
    favicon: './assets/images/logo.png',
    bundler: 'metro',
    output: 'static',
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
  plugins: [
    'expo-font',
    'expo-router',
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    apiUrl: process.env.API_URL || 'https://vivi-backend-ejes.onrender.com',
    eas: {
      projectId: 'a554a96f-dc38-4896-9ecb-1b76cf4a4178',
      package: 'com.mycompany.vivi'
    }
  },
  developmentClient: {
    silentLaunch: true
  }
};