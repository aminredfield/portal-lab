"use client";

import React, { useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function CrashPage() {
  const [crash, setCrash] = useState(false);
  if (crash) {
    // Throw an error intentionally to be caught by ErrorBoundary
    throw new Error('UI crash triggered');
  }
  return (
    <>
      <PageHeader title="Crash Lab" subtitle="This page intentionally crashes to test ErrorBoundary." />
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" gutterBottom>
          Clicking the button below will throw a rendering error. The ErrorBoundary
          will catch it and display a fallback UI with options to reload.
        </Typography>
        <Button variant="contained" color="error" onClick={() => setCrash(true)}>Crash UI</Button>
      </Paper>
    </>
  );
}