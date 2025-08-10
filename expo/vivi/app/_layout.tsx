import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, LogBox, Text } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

import { useColorScheme } from '@/hooks/useColorScheme';

// Suppress pointerEvents deprecation warning
LogBox.ignoreLogs(['props.pointerEvents is deprecated. Use style.pointerEvents']);

function AppContent() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  console.log('AppContent: Loading state:', loading, 'User:', user);

  if (loading) {
    console.log('AppContent: Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading Vivi...</Text>
      </View>
    );
  }

  console.log('AppContent: User authenticated:', !!user, 'Showing:', user ? '(tabs)' : '(auth)');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          // User is authenticated, show main app
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          // User is not authenticated, show auth screens
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Starting app initialization...');
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  console.log('RootLayout: Fonts loaded:', loaded);

  if (!loaded) {
    console.log('RootLayout: Fonts not loaded, showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Initializing Vivi...</Text>
      </View>
    );
  }

  console.log('RootLayout: Fonts loaded successfully, rendering app');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
