// src/lib/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = '/api/proxy';  // Keep this relative

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

// Response interceptor remains the same
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth related API calls - notice we're using the full path now
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const { data } = await api.post('/internal/auth/signin/email/', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    const { data } = await api.post('/internal/auth/register/', userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default api;