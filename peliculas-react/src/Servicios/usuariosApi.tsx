import api from "./api";

  // usuariosApi.ts
;

type UsuarioForm = { nombre?: string; rolId?: number; activo?: boolean };

export const usuariosApi = {
  roles:       () => api.get<{ id:number; nombre:string; descripcion?:string }[]>("/usuarios/roles"),
  get:         (id:number) => api.get(`/usuarios/${id}`),
  list:        (p:{ q?:string; page?:number; pageSize?:number; rolId?:number; activo?:boolean }) =>
                  api.get("/usuarios", { params: p }),

  create:      (p:{ nombre:string; contrasena:string; rolId:number; activo:boolean }) =>
                  api.post("/usuarios", p),

  update:      (id:number, p:UsuarioForm) =>
                  api.put(`/usuarios/${id}`, p),                         // ✅ /usuarios/{id}

  // Elige UNA según tu backend:
  // Si tu controlador es PATCH /api/usuarios/{id}/password:
  resetPassword:(id:number, nuevaContrasena:string) =>
                  api.patch(`/usuarios/${id}/password`, { nuevaContrasena }),   // ✅ /usuarios/{id}/password

  // Si tu backend aún es POST /api/usuarios/{id}/reset-pass, entonces usa:
  // resetPassword:(id:number, nuevaContrasena:string) =>
  //               api.post(`/usuarios/${id}/reset-pass`, JSON.stringify(nuevaContrasena), {
  //                 headers:{ "Content-Type":"application/json" }
  //               }),

  toggle:      (id:number) => api.patch(`/usuarios/${id}/toggle`),       // ✅ /usuarios/{id}/toggle
};
