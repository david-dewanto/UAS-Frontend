// src/lib/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://127.0.0.1:8000/v1'
//'/api/proxy';  // Keep this relative // DEVELOPMENT SERVER

const api = axios.create({
  baseURL: API_URL,  
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key' : '6d04132e-abc1-4974-8b2f-d279bf7a2553-64690321-975b-4c3e-91be-7eb671802e96' // DEVELOPMENT SERVER
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