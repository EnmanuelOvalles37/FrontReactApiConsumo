
export type UsuarioList = { id:number; nombre:string; rol:string; activo:boolean };
export type UsuarioForm = { nombre:string; rolId:number; activo:boolean; contrasena?:string };

export type Rol = { id:number; nombre:string; descripcion?:string|null };
export type RolPermisoCheck = { id:number; codigo:string; nombre:string; asignado:boolean };

export type SeguridadListDto = {
  id: number;
  nombre: string;
  rol: string;
  activo: boolean;
};

export type UsuarioCreateDto = {
  nombre: string;
  contrasena: string;
  rolId: number;
  activo: boolean;
};

export type UsuarioUpdateDto = {
  nombre: string;
  rolId: number;
  activo: boolean;
};

export type UsuarioPasswordDto = {
  nuevaContrasena: string;
};

export type RolDto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
};

export type PermisoDto = {
  id: number;
  codigo: string;
  nombre: string;
  ruta: string;
};

export type RolPermisoCheckDto = {
  id: number;
  codigo: string;
  nombre: string;
  asignado: boolean;
};

export type RolPermisosUpdateDto = {
  permisoIds: number[];
};