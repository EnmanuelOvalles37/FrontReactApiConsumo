//import axios from "axios";
import type {
    SeguridadListDto, UsuarioCreateDto, UsuarioUpdateDto, UsuarioPasswordDto,
    RolDto, PermisoDto, RolPermisoCheckDto, //RolPermisosUpdateDto
} from "../../assets/types/seguridad";
import api from "../../Servicios/api";

export const segApi = {
  // Usuarios
  async listUsuarios(): Promise<SeguridadListDto[]> {
    const { data } = await api.get("/api/usuarios");
    return data;
  },
  async createUsuario(dto: UsuarioCreateDto): Promise<SeguridadListDto> {
    const { data } = await api.post("/api/usuarios", dto);
    return data;
  },
  async updateUsuario(id: number, dto: UsuarioUpdateDto): Promise<void> {
    await api.put(`/api/usuarios/${id}`, dto);
  },
  async changePassword(id: number, dto: UsuarioPasswordDto): Promise<void> {
    await api.put(`/api/usuarios/${id}/password`, dto);
  },
  async deleteUsuario(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  },
  
  
  listRoles: async () => (await api.get("/seguridad/roles")).data as RolDto[],
  listPermisos: async () => (await api.get("/seguridad/permisos")).data as PermisoDto[],
  listPermisosDeRol: async (rolId:number) =>
    (await api.get(`/seguridad/roles/${rolId}/permisos`)).data as RolPermisoCheckDto[],
  updatePermisosDeRol: async (rolId:number, ids:number[]) =>
    api.put(`/seguridad/roles/${rolId}/permisos`, { permisoIds: ids }),

};
