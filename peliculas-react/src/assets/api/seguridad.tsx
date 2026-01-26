/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/seguridad.ts
//import axios from "axios";
import api from "../../Servicios/api";

export type RolDto = { id:number; nombre:string; descripcion?:string|null };
export type RolPermisoCheckDto = { id:number; codigo:string; nombre:string; asignado:boolean };

/*export async function getRoles(){
  const {data} = await api.get<RolDto[]>("/usuarios/roles");
  return data;
}*/
export const getRoles = async (): Promise<RolDto[]> => {
  const res = await api.get("/roles");

  return res.data.map((r: any) => ({
    id: r.id ?? r.Id,
    nombre: r.nombre ?? r.Nombre,
    descripcion: r.descripcion ?? r.Descripcion,
    permisos: r.permisos ?? []
  }));
};


export async function getPermisosDeRol(rolId:number){
  const {data} = await api.get<RolPermisoCheckDto[]>(`/roles/${rolId}/permisos`);
  return data;
}

export async function updatePermisosDeRol(rolId:number, permisoIds:number[]){
  await api.put(`/seguridad/roles/${rolId}/permisos`, { permisoIds });
}

export async function updateUsuarioRol(usuarioId:number, rolId:number){
  await api.put(`/seguridad/usuarios/${usuarioId}/rol`, { rolId });
}
