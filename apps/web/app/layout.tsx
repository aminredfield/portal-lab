"use client"
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';
import { ToastProvider } from '@/components/ToastProvider';
import useAuth from '@/store/auth';
import { useEffect } from 'react';

// Import Inter font from Google. This ensures consistent typography.
const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'Portal Lab',
//   description: 'Internal portal demonstrating auth, uploads, errors and performance.'
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hydrateAuth = useAuth((state) => state.hydrate);
  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}