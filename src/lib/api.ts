// src/lib/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = '/api/proxy'
//'http://127.0.0.1:8000/v1';  // Keep this relative // DEVELOPMENT SERVER

const api = axios.create({
  baseURL: API_URL,  
  headers: {
    'Content-Type': 'application/json',
    // 'X-API-Key' : '621f00b1-c60e-44dc-9455-fc3cd86b7868-4fdd7370-25db-42c5-9de2-71487994c6ad' // DEVELOPMENT SERVER
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