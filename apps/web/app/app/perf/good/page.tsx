"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Typography, TextField, List, ListItem, ListItemText } from '@mui/material';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), { ssr: false, loading: () => null });

// Create the same list as in the bad implementation but memoized. The list
// itself never changes so useMemo prevents reallocation on each render.
const items = Array.from({ length: 200 }, (_, i) => `Item ${i + 1}`);

export default function PerfGoodPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState(query);
  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(handler);
  }, [query]);
  const filtered = useMemo(() => {
    return items.filter((item) => item.toLowerCase().includes(debounced.toLowerCase()));
  }, [debounced]);
  return (
    <>
      <PageHeader title="Performance Lab" subtitle="Good implementation" />
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Optimised hero image using next/image with priority for LCP */}
        <Image
          src="https://picsum.photos/800/300"
          alt="Hero"
          width={800}
          height={300}
          priority
          style={{ width: '100%', height: 'auto', borderRadius: 8, marginBottom: 16 }}
        />
        {/* Debounced search input */}
        <TextField
          fullWidth
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        {/* Heavy component loaded dynamically */}
        <HeavyComponent />
        {/* Memoised list */}
        <List>
          {filtered.map((item) => (
            <ListItem key={item}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        {/* Documentation widget */}
        <Paper sx={{ p: 2, mt: 2 }} variant="outlined">
          <Typography variant="h6" gutterBottom>What changed</Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Hero image uses <code>next/image</code> with proper sizing and priority for faster LCP.</li>
            <li>Heavy component is dynamically imported to split the bundle.</li>
            <li>Search input is debounced to reduce unnecessary renders.</li>
            <li>List is memoised via <code>useMemo</code>.</li>
          </Typography>
        </Paper>
      </Paper>
    </>
  );
}