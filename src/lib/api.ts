// src/lib/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = '/api/proxy'
//'http://127.0.0.1:8000/v1';  // Keep this relative // DEVELOPMENT SERVER

const api = axios.create({
  baseURL: API_URL,  
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor for auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.url) return config;
  
  // Ensure url starts with '/' if it doesn't already
  if (!config.url.startsWith('/')) {
    config.url = '/' + config.url;
  }
  
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Request URL:', `${config.baseURL}${config.url}`);
    console.log('Request config:', {
      method: config.method,
      headers: config.headers,
      data: config.data
    });
  }
  
  return config;
});

// Response interceptor for authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;