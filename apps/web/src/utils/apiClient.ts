import axios from 'axios';
import useAuth from '../store/auth';
import { useToast } from '../components/ToastProvider';

export type ApiError =
  | { type: 'NETWORK'; message: string }
  | { type: 'HTTP'; status: number; message: string }
  | { type: 'VALIDATION'; status: 422; message: string; details: Record<string, string> }
  | { type: 'UNKNOWN'; message: string };

// Create an Axios instance with the base URL pointing at the API prefix.
const instance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api' });

// Interceptor to attach the Authorization header when a token is available. We
// cannot access Zustand store directly here because interceptors run outside
// React, so the caller should set headers manually when needed. The
// following is kept as an example of how you might automate this.

// Normalize errors thrown by axios into our ApiError union. The error is
// rethrown so callers can handle it as a rejected promise.
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    let apiError: ApiError;
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data || {};
      if (status === 422) {
        apiError = { type: 'VALIDATION', status, message: data.message || 'Validation error', details: data.details || {} };
      } else {
        apiError = { type: 'HTTP', status, message: data.message || `HTTP ${status}` };
      }
    } else if (error.request) {
      apiError = { type: 'NETWORK', message: 'Network error' };
    } else {
      apiError = { type: 'UNKNOWN', message: error.message || 'Unknown error' };
    }
    return Promise.reject(apiError);
  }
);

export default instance;