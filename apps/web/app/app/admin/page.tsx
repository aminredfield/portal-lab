"use client";

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  Alert,
} from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import PageHeader from '@/components/PageHeader';

export default function AdminPage() {
  return (
    <Box>
      <PageHeader
        title="Админ панель"
        subtitle="Управление системой (только для администраторов)"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        Это демонстрационная страница. Функции недоступны в demo-режиме.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={1}>
            <CardContent>
              <VpnKeyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                API ключи
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ротация и управление API ключами
              </Typography>
              <Button variant="outlined" disabled fullWidth startIcon={<VpnKeyIcon />}>
                Управление ключами
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={1}>
            <CardContent>
              <HistoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Журнал аудита
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Просмотр логов действий пользователей
              </Typography>
              <Button variant="outlined" disabled fullWidth startIcon={<HistoryIcon />}>
                Открыть журнал
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={1}>
            <CardContent>
              <SettingsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Настройки системы
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Конфигурация портала
              </Typography>
              <Button variant="outlined" disabled fullWidth startIcon={<SettingsIcon />}>
                Настройки
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}