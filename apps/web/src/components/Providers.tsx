"use client";

import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';
import { ToastProvider } from '@/components/ToastProvider';
import useAuth from '@/store/auth';

export default function Providers({ children }: { children: React.ReactNode }) {
    const hydrateAuth = useAuth((state) => state.hydrate);

    useEffect(() => {
        hydrateAuth();
    }, [hydrateAuth]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    );
}