//import axios from "axios";
import api from "./api";

export type EmpresaList = { id:number; rnc:string; nombre:string; activo:boolean; empleados:number };
export type EmpresaForm = { rnc:string; nombre:string; telefono?:string|null; email?:string|null; direccion?:string|null; activo:boolean };

export const empresasApi = {
  list: (q?:string) => api.get<EmpresaList[]>("/api/empresas", { params:{ q } }).then(r=>r.data),
  get: (id:number) => api.get<EmpresaForm>(`/api/empresas/${id}`).then(r=>r.data),
  create: (p:EmpresaForm) => api.post("/api/empresas", p),
  update: (id:number, p:EmpresaForm) => api.put(`/api/empresas/${id}`, p),
};