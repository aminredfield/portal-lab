"use client";

import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Checkbox, Stack } from '@mui/material';
import PageHeader from '@/components/PageHeader';
import useAuth from '@/store/auth';

export default function ProfilePage() {
  const { email, role, exp } = useAuth();
  // Define accessible sections based on role
  const sections: { name: string; roles: ('admin' | 'manager' | 'viewer')[] }[] = [
    { name: 'Uploads', roles: ['admin', 'manager', 'viewer'] },
    { name: 'Reports', roles: ['admin', 'manager'] },
    { name: 'Admin', roles: ['admin'] },
    { name: 'Errors Lab', roles: ['admin', 'manager', 'viewer'] },
    { name: 'Performance Lab', roles: ['admin', 'manager', 'viewer'] }
  ];
  const canAccess = (sectionRoles: string[]) => (role ? sectionRoles.includes(role) : false);
  return (
    <>
      <PageHeader title="Profile" subtitle="Your session details and access" />
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }} elevation={1}>
          <Typography variant="h6" gutterBottom>Session</Typography>
          <Typography variant="body2">Email: {email}</Typography>
          <Typography variant="body2">Role: {role}</Typography>
          {exp && <Typography variant="body2">Token expires at: {new Date(exp * 1000).toLocaleString()}</Typography>}
        </Paper>
        <Paper sx={{ p: 2 }} elevation={1}>
          <Typography variant="h6" gutterBottom>Access</Typography>
          <List>
            {sections.map((sec) => (
              <ListItem key={sec.name}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={canAccess(sec.roles)} tabIndex={-1} disableRipple inputProps={{ 'aria-labelledby': `section-${sec.name}` }} />
                </ListItemIcon>
                <ListItemText id={`section-${sec.name}`} primary={sec.name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Stack>
    </>
  );
}