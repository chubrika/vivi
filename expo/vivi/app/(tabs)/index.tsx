import { Redirect } from 'expo-router';

export default function TabIndex() {
  console.log('TabIndex: Redirecting to dashboard');
  // Redirect to dashboard when accessing the tabs layout
  return <Redirect href="/dashboard" />;
}
