import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7105/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const saved = localStorage.getItem("authToken");
if (saved) api.defaults.headers.common.Authorization = `Bearer ${saved}`;


// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);



// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (error: { config: any; response: { status: number; }; }) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {        
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;