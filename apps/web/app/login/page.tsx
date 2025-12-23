"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Divider,
  Container,
  InputAdornment,
  IconButton,
  Fade,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import { ThemeProvider, CssBaseline } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import useAuth from '@/store/auth';
import { ToastProvider, useToast } from '@/components/ToastProvider';
import theme from '@/theme';

function LoginPageContent() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }
    if (password.length < 3) {
      setError('Пароль должен содержать минимум 3 символа');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, role, exp } = response.data;
      login({ token, role, exp, email });
      addToast('Добро пожаловать!', 'success');
      router.push('/app/profile');
    } catch (err: any) {
      if (err.type === 'HTTP' && err.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError(err.message || 'Ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: 'admin' | 'manager' | 'viewer') => {
    const emailMap = {
      admin: 'admin@demo.com',
      manager: 'manager@demo.com',
      viewer: 'viewer@demo.com',
    };
    setEmail(emailMap[role]);
    setPassword('123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                }}
              >
                <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                Portal Lab
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Демо-портал с аутентификацией и RBAC
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  helperText="Для демо используйте пароль: 123"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={loading}
                  disabled={!email || !password}
                  startIcon={<LoginIcon />}
                  fullWidth
                >
                  Войти
                </LoadingButton>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Быстрый вход
              </Typography>
            </Divider>

            <Stack spacing={1}>
              <Button variant="outlined" color="error" size="small" onClick={() => quickLogin('admin')} fullWidth>
                Войти как Администратор
              </Button>
              <Button variant="outlined" color="warning" size="small" onClick={() => quickLogin('manager')} fullWidth>
                Войти как Менеджер
              </Button>
              <Button variant="outlined" size="small" onClick={() => quickLogin('viewer')} fullWidth>
                Войти как Наблюдатель
              </Button>
            </Stack>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Тестовые аккаунты:</strong><br />
                • admin@demo.com – полный доступ<br />
                • manager@demo.com – доступ менеджера<br />
                • viewer@demo.com – только просмотр<br /><br />
                Пароль для всех: <strong>123</strong>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <LoginPageContent />
      </ToastProvider>
    </ThemeProvider>
  );
}