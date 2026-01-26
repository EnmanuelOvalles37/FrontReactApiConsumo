import api from './api';
import type { LoginResponse, User } from '../types';

export const authService = {
  login: async (usuario: string, contrasena: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', { 
        usuario, 
        contrasena 
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          usuario: response.data.usuario,
          rol: response.data.rol,
          permisos: response.data.permisos,
          expiracion: response.data.expiracion
        }));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated'); // ← Mantener compatibilidad
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    const userData = authService.getCurrentUser();
    
    if (!token || !userData) return false;
    
    // Verificar si el token está expirado
    try {
      const expiracion = new Date(userData.expiracion);
      return expiracion > new Date();
    } catch {
      return false;
    }
  },

  hasPermission: (permiso: string): boolean => {
    const userData = authService.getCurrentUser();
    return userData?.permisos?.includes(permiso) || false;
  }
};