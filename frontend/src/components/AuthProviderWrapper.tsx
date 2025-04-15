'use client';

import { AuthProvider } from '../utils/authContext';

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
} 