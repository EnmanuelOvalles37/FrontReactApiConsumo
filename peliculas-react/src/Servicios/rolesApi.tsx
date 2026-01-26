//import axios from "axios";
import type { Rol, RolPermisoCheck } from "../assets/types/seguridad";
import api from "./api";

export const rolesApi = {
  list: () => api.get<Rol[]>("/api/roles").then(r => r.data),
  permisos: (rolId:number) => api.get<RolPermisoCheck[]>(`/api/roles/${rolId}/permisos`).then(r => r.data),
  updatePermisos: (rolId:number, permisoIds:number[]) =>
    api.put(`/api/roles/${rolId}/permisos`, { permisoIds })
};