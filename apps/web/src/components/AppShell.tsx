"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Box,
  Tooltip,
  ListSubheader,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuth from '@/store/auth';

interface MenuItemDef {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ('admin' | 'manager' | 'viewer')[];
  category: string;
}

const menuItems: MenuItemDef[] = [
  {
    label: 'Профиль',
    href: '/app/profile',
    icon: <PersonIcon />,
    roles: ['admin', 'manager', 'viewer'],
    category: 'Основное'
  },
  {
    label: 'Загрузки',
    href: '/app/uploads',
    icon: <CloudUploadIcon />,
    roles: ['admin', 'manager', 'viewer'],
    category: 'Основное'
  },
  {
    label: 'Отчеты',
    href: '/app/reports',
    icon: <BarChartIcon />,
    roles: ['admin', 'manager'],
    category: 'Основное'
  },
  {
    label: 'Админ панель',
    href: '/app/admin',
    icon: <AdminPanelSettingsIcon />,
    roles: ['admin'],
    category: 'Основное'
  },
  {
    label: 'Тест ошибок',
    href: '/app/errors/api',
    icon: <BugReportIcon />,
    roles: ['admin', 'manager', 'viewer'],
    category: 'Разработка'
  },
  {
    label: 'Производительность',
    href: '/app/perf/bad',
    icon: <SpeedIcon />,
    roles: ['admin', 'manager', 'viewer'],
    category: 'Разработка'
  },
];

const DRAWER_WIDTH = 260;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, email, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    handleMenuClose();
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    if (!isMdUp) setMobileOpen(false);
  };

  const filtered = menuItems.filter((item) => (role ? item.roles.includes(role) : false));
  const categories = Array.from(new Set(filtered.map((item) => item.category)));

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'viewer': return 'Наблюдатель';
      default: return role;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          Portal Lab
        </Typography>
      </Toolbar>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {categories.map((category) => (
          <Box key={category}>
            <ListSubheader
              sx={{
                bgcolor: 'transparent',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              {category}
            </ListSubheader>
            <List dense>
              {filtered
                .filter((item) => item.category === category)
                .map((item) => {
                  const selected = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <ListItemButton
                      key={item.href}
                      selected={selected}
                      onClick={() => handleNavigate(item.href)}
                      sx={{
                        mx: 1,
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'primary.contrastText',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: selected ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  );
                })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
            {email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.813rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {email}
            </Typography>
            <Chip
              label={getRoleLabel(role || '')}
              size="small"
              color={getRoleColor(role || '')}
              sx={{ height: 20, fontSize: '0.688rem', mt: 0.5 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {!isMdUp && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
            Portal Lab
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMdUp && role && (
              <Chip
                label={getRoleLabel(role)}
                size="small"
                color={getRoleColor(role)}
                variant="outlined"
              />
            )}

            <Tooltip title="Профиль и выход">
              <IconButton onClick={handleAvatarClick} size="small">
                <Avatar sx={{ width: 32, height: 32 }}>
                  {email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleNavigate('/app/profile'); handleMenuClose(); }}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Профиль" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Выйти" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
        }}
        open
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: '56px', sm: '64px' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}