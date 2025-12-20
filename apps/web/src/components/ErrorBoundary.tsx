"use client";

import React from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary catches unexpected runtime errors in the React component tree
 * below it. When an error is caught a fallback UI is displayed with a
 * reload button. In a real app you could log the error to an external
 * service. This boundary resets itself when the user navigates away.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

function ErrorFallback() {
  const router = useRouter();
  return (
    <Box
      sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}
    >
      <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body2">An unexpected error occurred. Please try reloading the page.</Typography>
      </Alert>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={() => router.push('/app/profile')}>Go to Profile</Button>
        <Button variant="outlined" onClick={() => router.refresh()}>Reload</Button>
      </Box>
    </Box>
  );
}