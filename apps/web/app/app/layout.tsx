"use client";

import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import theme from '@/theme';
import { ToastProvider, useToast } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AppShell from '@/components/AppShell';
import useAuth from '@/store/auth';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { token, exp, initialized, logout, hydrate } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  // Гидрация auth при монтировании
  useEffect(() => {
    if (!initialized) {
      hydrate();
    }
  }, [initialized, hydrate]);

  // Проверка истечения токена
  useEffect(() => {
    if (!initialized) return;

    if (!token || !exp) {
      router.push('/login');
      return;
    }

    // Проверяем, не истек ли токен
    const checkTokenExpiry = () => {
      if (exp * 1000 < Date.now()) {
        addToast('Сессия истекла. Войдите снова.', 'warning');
        logout();
        router.push('/login');
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, [token, exp, initialized, logout, router, addToast]);

  // Обработка редиректов от middleware
  useEffect(() => {
    const noAccess = searchParams?.get('noAccess');
    if (noAccess === '1') {
      addToast('У вас нет доступа к этой странице.', 'error');
      const url = new URL(window.location.href);
      url.searchParams.delete('noAccess');
      router.replace(url.pathname);
    }
  }, [searchParams, addToast, router]);

  if (!initialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell>{children}</AppShell>
    </ErrorBoundary>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </ToastProvider>
    </ThemeProvider>
  );
}