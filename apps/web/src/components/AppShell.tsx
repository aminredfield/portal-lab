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
  CssBaseline,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonIcon from '@mui/icons-material/Person';
import useAuth from '@/store/auth';

interface AppShellProps {
  children: React.ReactNode;
}

interface MenuItemDef {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ('admin' | 'manager' | 'viewer')[];
}

const menuItems: MenuItemDef[] = [
  { label: 'Uploads', href: '/app/uploads', icon: <CloudUploadIcon />, roles: ['admin', 'manager', 'viewer'] },
  { label: 'Reports', href: '/app/reports', icon: <BarChartIcon />, roles: ['admin', 'manager'] },
  { label: 'Admin', href: '/app/admin', icon: <AdminPanelSettingsIcon />, roles: ['admin'] },
  { label: 'Errors Lab', href: '/app/errors/api', icon: <BugReportIcon />, roles: ['admin', 'manager', 'viewer'] },
  { label: 'Performance Lab', href: '/app/perf/bad', icon: <SpeedIcon />, roles: ['admin', 'manager', 'viewer'] },
  { label: 'Profile', href: '/app/profile', icon: <PersonIcon />, roles: ['admin', 'manager', 'viewer'] }
];

/**
 * AppShell provides the common layout for the protected /app pages. It
 * implements an AppBar with the portal title, the current user's role as a
 * chip, an avatar menu for logout and a responsive Drawer for navigation.
 */
export default function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { token, role, email, logout } = useAuth();
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

  // Filter menu items based on role
  const filtered = menuItems.filter((item) => (role ? item.roles.includes(role) : false));
  const drawer = (
    <div>
      <Toolbar sx={{ minHeight: '64px' }} />
      <Divider />
      <List>
        {filtered.map((item) => {
          const selected = pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              selected={selected}
              onClick={() => {
                router.push(item.href);
                if (!isMdUp) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {!isMdUp && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Portal Lab
          </Typography>
          {role && (
            <Chip
              label={`Role: ${role}`}
              color="primary"
              variant="filled"
              sx={{ mr: 2 }}
            />
          )}
          {email && (
            <>
              <IconButton color="inherit" onClick={handleAvatarClick}>
                <Avatar>{email[0]?.toUpperCase()}</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { router.push('/app/profile'); handleMenuClose(); }}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        {!isMdUp && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
            }}
          >
            {drawer}
          </Drawer>
        )}
        {/* Desktop drawer */}
        {isMdUp && (
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - 240px)` }, mt: '64px' }}
      >
        {children}
      </Box>
    </Box>
  );
}