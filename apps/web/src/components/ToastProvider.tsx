"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, SnackbarCloseReason } from '@mui/material';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
}

interface ToastContextValue {
  addToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

/**
 * ToastProvider wraps its children and exposes an `addToast` function via
 * context. Toasts are displayed in a stack (one at a time) and auto‑dismissed
 * after 5 seconds. Identical messages triggered within 2 seconds of each
 * other will be ignored to prevent spam.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastToastTime, setLastToastTime] = useState<number>(0);
  const addToast = useCallback(
    (message: string, severity: ToastSeverity = 'info') => {
      const now = Date.now();
      if (now - lastToastTime < 2000) {
        // Avoid spamming duplicates within 2 seconds
        const recent = toasts[toasts.length - 1];
        if (recent && recent.message === message) {
          return;
        }
      }
      toastCounter += 1;
      const id = toastCounter;
      setToasts((current) => [...current, { id, message, severity }]);
      setLastToastTime(now);
    },
    [lastToastTime, toasts]
  );
  const handleClose = (_event: unknown, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    setToasts((current) => current.slice(1));
  };
  const currentToast = toasts[0];
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {currentToast && (
        <Snackbar
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity={currentToast.severity} sx={{ width: '100%' }}>
            {currentToast.message}
          </Alert>
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}