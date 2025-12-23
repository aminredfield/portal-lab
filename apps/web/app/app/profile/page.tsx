"use client";

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import PageHeader from '@/components/PageHeader';
import useAuth from '@/store/auth';

export default function ProfilePage() {
  const { email, role, exp } = useAuth();

  const sections = [
    { name: 'Профиль', roles: ['admin', 'manager', 'viewer'] },
    { name: 'Загрузки файлов', roles: ['admin', 'manager', 'viewer'] },
    { name: 'Отчеты', roles: ['admin', 'manager'] },
    { name: 'Админ панель', roles: ['admin'] },
    { name: 'Лаборатория ошибок', roles: ['admin', 'manager', 'viewer'] },
    { name: 'Лаборатория производительности', roles: ['admin', 'manager', 'viewer'] },
  ];

  const canAccess = (sectionRoles: string[]) => (role ? sectionRoles.includes(role) : false);

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Администратор', color: 'error' as const, description: 'Полный доступ' };
      case 'manager':
        return { label: 'Менеджер', color: 'warning' as const, description: 'Доступ к загрузкам и отчетам' };
      case 'viewer':
        return { label: 'Наблюдатель', color: 'default' as const, description: 'Только просмотр' };
      default:
        return { label: role, color: 'default' as const, description: 'Базовый доступ' };
    }
  };

  const roleInfo = role ? getRoleInfo(role) : null;
  const expiresAt = exp ? new Date(exp * 1000) : null;
  const hoursRemaining = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)) : 0;

  return (
    <Box>
      <PageHeader title="Профиль" subtitle="Информация о вашей сессии и правах доступа" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', mr: 2 }}>
                  {email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{email || 'Пользователь'}</Typography>
                  {roleInfo && (
                    <Chip label={roleInfo.label} color={roleInfo.color} size="small" icon={<SecurityIcon />} />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{email || '—'}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Роль</Typography>
                    <Typography variant="body2">{roleInfo?.label || '—'}</Typography>
                    {roleInfo && (
                      <Typography variant="caption" color="text.secondary">{roleInfo.description}</Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Сессия истекает</Typography>
                    <Typography variant="body2">
                      {expiresAt ? expiresAt.toLocaleString('ru-RU') : '—'}
                    </Typography>
                    {hoursRemaining > 0 && (
                      <Typography variant="caption" color="text.secondary">Осталось ~{hoursRemaining} ч.</Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Права доступа</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Разделы портала, доступные для вашей роли
              </Typography>

              <List dense sx={{ mt: 2 }}>
                {sections.map((sec) => {
                  const hasAccess = canAccess(sec.roles);
                  return (
                    <ListItem key={sec.name} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {hasAccess ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <CancelIcon color="disabled" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={sec.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: hasAccess ? 'text.primary' : 'text.disabled',
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }} elevation={0}>
        <CardContent>
          <Typography variant="body2">
            💡 <strong>Подсказка:</strong> Токен сессии автоматически истечет через 24 часа после входа.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}