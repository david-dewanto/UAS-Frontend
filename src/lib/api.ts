// src/lib/api.ts
import axios from 'axios';

const API_URL = '/api/'; 
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || '621f00b1-c60e-44dc-9455-fc3cd86b7868-4fdd7370-25db-42c5-9de2-71487994c6ad';

const api = axios.create({
  baseURL: API_URL,  
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': INTERNAL_API_KEY,
  },
  withCredentials: false,  
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
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

// Auth related API calls
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default api;