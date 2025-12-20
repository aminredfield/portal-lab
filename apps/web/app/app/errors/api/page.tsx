"use client";

import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Stack, Alert } from '@mui/material';
import PageHeader from '@/components/PageHeader';
import axios from 'axios';
import useAuth from '@/store/auth';
import { useToast } from '@/components/ToastProvider';

export default function ApiErrorsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [lastError, setLastError] = useState<any>(null);

  const trigger = async (endpoint: string, method: 'get' | 'post') => {
    try {
      const config: any = { headers: { Authorization: `Bearer ${token}` } };
      let res;
      if (method === 'get') res = await axios.get(endpoint, config);
      else res = await axios.post(endpoint, {}, config);
      // If no error thrown it's unexpected in demo
      addToast('Request succeeded (unexpected)', 'info');
      setLastError(null);
    } catch (err: any) {
      // The error comes from Axios interceptor normalization in apiClient
      const errorData = err;
      setLastError(errorData);
      // Map error types to toast messages
      if (errorData.type === 'NETWORK') addToast('Network error. Check your connection.', 'error');
      else if (errorData.type === 'HTTP') {
        if (errorData.status === 401) addToast('Session expired. Please log in again.', 'error');
        else if (errorData.status === 403) addToast('No access.', 'error');
        else if (errorData.status === 500) addToast('Server error. Try again later.', 'error');
        else addToast(errorData.message, 'error');
      } else if (errorData.type === 'VALIDATION') {
        addToast('Please check the form.', 'error');
      } else {
        addToast('Unknown error', 'error');
      }
    }
  };

  return (
    <>
      <PageHeader title="Errors Lab" subtitle="Trigger API errors to test handling" />
      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>API errors</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" onClick={() => trigger('/api/demo/http-500', 'get')}>Trigger 500</Button>
          <Button variant="outlined" onClick={() => trigger('/api/demo/http-401', 'get')}>Trigger 401</Button>
          <Button variant="outlined" onClick={() => trigger('/api/demo/validation', 'post')}>Trigger validation</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Typography variant="h6" gutterBottom>Last error payload</Typography>
        {lastError ? (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(lastError, null, 2)}</pre>
        ) : (
          <Typography variant="body2" color="text.secondary">No error triggered yet.</Typography>
        )}
      </Paper>
    </>
  );
}