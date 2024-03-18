'use client';

import { ThemeProvider } from 'acme-theme';
import { AuthProvider } from 'acme-auth';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}