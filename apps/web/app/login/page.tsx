"use client";

import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Stack, Alert } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import useAuth from '@/store/auth';
import { useToast } from '@/components/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Simple client validation
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, role, exp } = response.data;
      login({ token, role, exp, email });
      addToast('Welcome back', 'success');
      router.push('/app/profile');
    } catch (err: any) {
      if (err.type === 'HTTP' && err.status === 401) {
        setError('Invalid credentials');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: 'admin' | 'manager' | 'viewer') => {
    const emailMap: Record<typeof role, string> = {
      admin: 'admin@demo.com',
      manager: 'manager@demo.com',
      viewer: 'viewer@demo.com'
    };
    setEmail(emailMap[role]);
    setPassword('123');
    // Immediately submit
    setTimeout(() => {
      const form = document.getElementById('loginForm');
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }} elevation={3}>
        <Typography variant="h5" gutterBottom>Sign in to Portal Lab</Typography>
        <form id="loginForm" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Use password 123 for demo"
            />
            {error && <Alert severity="error">{error}</Alert>}
            <LoadingButton type="submit" variant="contained" loading={loading} disabled={!email || !password || loading}>
              Sign in
            </LoadingButton>
          </Stack>
        </form>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>Quick logins:</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => quickLogin('admin')}>Login as Admin</Button>
            <Button variant="outlined" size="small" onClick={() => quickLogin('manager')}>Login as Manager</Button>
            <Button variant="outlined" size="small" onClick={() => quickLogin('viewer')}>Login as Viewer</Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}