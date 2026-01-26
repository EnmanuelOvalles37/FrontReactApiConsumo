// src/api/admin.ts
//import axios from "axios";
import api from "../../Servicios/api";

export const adminApi = {
  // Usuarios
  getUsuarios: () => api.get("/admin/usuarios").then(r => r.data),
  createUsuario: (payload: {nombre:string; contrasena:string; rolId:number; activo:boolean;}) =>
    api.post("/api/admin/usuarios", payload).then(r => r.data),
  updateUsuario: (id:number, payload: {nombre?:string; rolId?:number; activo?:boolean;}) =>
    api.put(`/api/admin/usuarios/${id}`, payload),
  changePassword: (id:number, payload:{contrasenaActual:string; contrasenaNueva:string;}) =>
    api.put(`/api/admin/usuarios/${id}/password`, payload),
  deleteUsuario: (id:number) => api.delete(`/api/admin/usuarios/${id}`),

  // Roles
 getRoles:      () => api.get("/usuarios/roles").then(r => r.data), // ✅ sin /api
  createRol:     (p:{nombre:string; descripcion?:string}) => api.post("/admin/roles", p), // solo si existe en backend
  updateRol:     (id:number, p:{nombre?:string; descripcion?:string}) => api.put(`/admin/roles/${id}`, p),
  getPermisosRol:(id:number) => api.get(`/admin/roles/${id}/permisos`).then(r => r.data),
  setPermisosRol:(id:number, permisoIds:number[]) => api.put(`/admin/roles/${id}/permisos`, { rolId:id, permisoIds }),
  // Catálogo de permisos
  getPermisos:   () => api.get("/permisos").then(r => r.data),
};
