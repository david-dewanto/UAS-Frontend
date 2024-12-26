// src/lib/api.ts
import axios from 'axios';

// Base URL pointing directly to your FastAPI backend
const API_URL = import.meta.env.VITE_API_URL || 'https://api.fintrackit.my.id';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for handling cookies if needed
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

// Secure API endpoints
export const secureApi = {
  getData: async () => {
    const { data } = await api.get('/secure/data');
    return data;
  },

  updateProfile: async (profileData: any) => {
    const { data } = await api.put('/secure/profile', profileData);
    return data;
  }
};

export default api;