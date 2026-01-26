
  import type { AsignacionInfo } from "../assets/types/Types";

export type User = {
  id?: number;           // <-- AGREGAR ESTO
  usuario: string;
  rol: string;
  permisos: string[];
  expiracion?: string;
  rolId: number;
  // Campos para tipo de usuario
  esCajero?: boolean;
  tipoUsuario?: string; // "admin" | "usuario" | "cajero" | "backoffice" | "empleador"
  asignacion?: AsignacionInfo;
};

export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  id: number;            // <-- AGREGAR ESTO
  usuario: string;
  rol: string;
  rolId: number;         // <-- AGREGAR ESTO
  expiracion: string;
  permisos: string[];
  esCajero?: boolean;
  tipoUsuario?: string;
  asignacion?: AsignacionInfo;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (usuario: string, contrasena: string) => Promise<LoginResult>;
  logout: () => void;
  hasPermission: (permiso: string) => boolean;
  isAuthenticated: boolean;  // Cambiado de funcion a booleano
  // Nuevos campos para redireccion
  rolId: number | null;
  esCajero: boolean;
  esBackoffice: boolean;
  esEmpleador: boolean;
  tipoUsuario: string | null;
}

export type LoginResult = {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    id: number;           // <-- AGREGAR ESTO
    usuario: string;
    rol: string;
    rolId: number;        // <-- AGREGAR ESTO
    permisos: string[];
    expiracion: string;
    esCajero: boolean;
    tipoUsuario: string;
    asignacion?: AsignacionInfo;
    requiereCambioContrasena: string;
  };
};