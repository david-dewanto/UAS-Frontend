// src/lib/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import { authService } from './auth';

const API_URL = '/api/proxy' // DEVELOPMENT SERVER /api/proxy

const api = axios.create({
  baseURL: API_URL,  
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
});

// Request interceptor for auth token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!config.url) return config;
  
  // Get current user
  const user = authService.getCurrentUser();
  
  if (user?.id_token) {
    // If it's not a token validation request (to avoid infinite loop)
    if (!config.url.includes('validate-token')) {
      try {
        // Use axios instance instead of fetch for consistent headers
        const { data } = await api.post('/internal/validate-token', {
          token: user.id_token
        });
        
        if (!data.is_valid) {
          authService.logout();
          throw new Error('Session expired');
        }
      } catch (error) {
        authService.logout();
        throw error;
      }
    }

    // Add token to request headers
    config.headers.Authorization = `Bearer ${user.id_token}`;
  }
  
  // Ensure url starts with '/' if it doesn't already
  if (!config.url.startsWith('/')) {
    config.url = '/' + config.url;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      authService.logout();
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    return Promise.reject(error);
  }
);

export default api;