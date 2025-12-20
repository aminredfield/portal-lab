"use client";

import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Admin" subtitle="Admin area with demo actions" />
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>Admin area</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" disabled title="Demo only">Rotate API keys</Button>
          <Button variant="contained" disabled title="Demo only">View audit log</Button>
        </Stack>
      </Paper>
    </>
  );
}