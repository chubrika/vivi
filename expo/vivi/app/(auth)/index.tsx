import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Redirect to login when accessing the auth layout
  return <Redirect href="/login" />;
}
