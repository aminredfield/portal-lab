"use client";

import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, List, ListItem, ListItemText } from '@mui/material';
import PageHeader from '@/components/PageHeader';

// Generate a static list of items for demonstration. In the bad implementation
// we do not memoize this list and we re-render the entire list on every
// keystroke.
const items = Array.from({ length: 200 }, (_, i) => `Item ${i + 1}`);

export default function PerfBadPage() {
  const [query, setQuery] = useState('');
  const filtered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <PageHeader title="Performance Lab" subtitle="Bad implementation" />
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Hero image using plain <img> without optimisation */}
        <img
          src="https://picsum.photos/800/300"
          alt="Hero"
          style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 16, borderRadius: 8 }}
        />
        {/* Search input without debounce */}
        <TextField
          fullWidth
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        {/* Render list without memoization */}
        <List>
          {filtered.map((item) => (
            <ListItem key={item}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </>
  );
}