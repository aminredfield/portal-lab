"use client";

import React from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Stack } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function ReportsPage() {
  // Placeholder data for demonstration
  const data = [
    { id: 1, name: 'Report A', date: '2023-01-01' },
    { id: 2, name: 'Report B', date: '2023-02-15' }
  ];
  return (
    <>
      <PageHeader title="Reports" subtitle="Demo page with filters and table" />
      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="From" type="date" InputLabelProps={{ shrink: true }} />
          <TextField label="To" type="date" InputLabelProps={{ shrink: true }} />
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>Reports</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}