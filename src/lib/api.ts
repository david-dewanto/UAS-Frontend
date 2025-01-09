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
  
  // Clean double slashes from URL
  config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
  
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Full request URL:', `${window.location.origin}${config.baseURL}${config.url}`);
    console.log('Request config:', {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      headers: config.headers
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