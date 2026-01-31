/* eslint-disable @typescript-eslint/no-explicit-any */

export interface User {
  id?: number;
  usuario: string;
  rol: string;
  rolId: number;
  permisos: string[];
  expiracion?: string;
  esCajero?: boolean;
  tipoUsuario?: string;
  asignacion?: any;
  clienteInfo?: any;
  requiereCambioContrasena?: boolean;
}

export interface LoginRequest {
  usuario: string;
  contrasena: string;
}



export interface LoginResponse {
  token: string;
  id: number;
  rolId: number;
  usuario: string;
  rol: string;
  expiracion: string;
  permisos: string[];
  esCajero?: boolean;
  tipoUsuario?: string;
  requiereCambioContrasena?: boolean;
  asignacion?: any;
  clienteInfo?: any;
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
    id: number;
    usuario: string;
    rol: string;
    rolId: number;
    permisos: string[];
    expiracion: string;
    esCajero?: boolean;              
    tipoUsuario?: string;            
    asignacion?: AsignacionInfo;     
    clienteInfo?: ClienteLoginInfo;  
    requiereCambioContrasena?: boolean;  
  };
};

export interface AsignacionInfo {
  proveedorId: number;
  proveedorNombre?: string;
  tiendaId?: number;
  tiendaNombre?: string;
  cajaId?: number;
  cajaNombre?: string;
  rol?: string;
}

export interface ClienteLoginInfo {
  clienteId: number;
  codigo: string;
  empresaId: number;
  empresaNombre: string;
}





