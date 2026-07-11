'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import SelectionTranslate from '@/components/SelectionTranslate';
import { ThemeProvider } from '@/lib/theme';
import WebVitals from './web-vitals';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 60_000,
          },
        },
      }),
  );

  const tree = (
    <ThemeProvider>
      <ErrorBoundary>
        <WebVitals />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <SelectionTranslate />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );

  if (!googleClientId) {
    return tree;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
}
