"use client";

import React from 'react';

// A dummy heavy component to simulate code splitting. In a real application
// this could be a chart library or any other large dependency. Here it
// simply renders a coloured box.
export default function HeavyComponent() {
  return (
    <div style={{ height: 200, backgroundColor: '#f5f5f5', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Heavy component loaded
    </div>
  );
}