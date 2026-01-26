

// src/Servicios/seguridadApi.ts
import api from "../../Servicios/api";

export const usuariosApi = {
  roles: () => api.get<{ id:number; nombre:string; descripcion?:string }[]>("/usuarios/roles"),
  get:   (id:number) => api.get(`/usuarios/${id}`),
  create:(p:{nombre:string; contrasena:string; rolId:number; activo:boolean}) => api.post("/usuarios", p),
  update:(id:number, p:{nombre?:string; rolId?:number; activo?:boolean}) => api.put(`/usuarios/${id}`, p),
  resetPassword:(id:number, nuevaContrasena:string) => api.patch(`/usuarios/${id}/password`, { nuevaContrasena }),
  list: (p:{ q?:string; page?:number; pageSize?:number; rolId?:number; activo?:boolean }) =>
    api.get("/usuarios", { params: p }),
};

export type RolDto = { id: number; nombre: string; descripcion?: string };
export type UsuarioListDto = {
  id: number; nombre: string; rol: string; activo: boolean;
  creadoUtc?: string | null; // si lo expones
};
export type UsuarioDetailDto = { id: number; nombre: string; rolId: number; activo: boolean };

export const segApi = {
  listRoles: async (): Promise<RolDto[]> => {
    const { data } = await api.get("/usuarios/roles");
    return data.data ?? data;    
  },
  //roles: () => api.get<{ id: number; nombre: string; descripcion: string }[]>("/usuarios/roles"),
  listUsuarios: async (): Promise<{ data: UsuarioListDto[] }> => {
    const { data } = await api.get("/usuarios");
    return { data: data.data ?? data };
  },
  getUsuario: async (id: number): Promise<UsuarioDetailDto> => {
    const { data } = await api.get(`/usuarios/${id}`);
    return {
      id: data.id, nombre: data.nombre, rolId: data.rolId, activo: data.activo,
    };
  },
  createUsuario: (p: { nombre: string; contrasena: string; rolId: number; activo: boolean }) =>
    api.post("/usuarios", p),
  updateUsuario: (id: number, p: { nombre?: string; rolId?: number; activo?: boolean }) =>
    api.put(`/usuarios/${id}`, p),
  resetPassword: (id: number, nuevaContrasena: string) =>
    api.patch(`/usuarios/${id}/password`, { nuevaContrasena }),   // <-- ruta final
  toggleUsuario: (id: number) => api.patch(`/usuarios/${id}/toggle`),
  deleteUsuario: (id: number) => api.delete(`/usuarios/${id}`),
};
export default segApi;

