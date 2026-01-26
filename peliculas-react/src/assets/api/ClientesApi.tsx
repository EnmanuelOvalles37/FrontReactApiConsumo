// Servicios/empresasClientesApi.ts

import api from "../../Servicios/api";
export type EmpresaForm   = {
     nombre: string;
     rnc?: string;
     limite_Credito: number;
     activo: boolean;
    telefono?: string;
    email?: string;
    direccion?: string; };
    
export type EmpresaUpdate = Partial<EmpresaForm>;

export type ClienteForm   = {
   nombre: string; cedula?: string; 
  saldoOriginal: number;  activo?: boolean
};
export type ClienteUpdate = {
  codigo?: string; nombre?: string; cedula?: string; grupo?: string;
  saldoOriginal?: number; diaCorte?: number; activo?: boolean
};

export const empresasApi = {
  list:   (p:{ q?:string; page?:number; pageSize?:number }) => api.get("/empresas", { params: p }),
  get:    (id:number) => api.get(`/empresas/${id}`),
  create: (p:EmpresaForm) => api.post("/empresas", p),
  update: (id:number, p:EmpresaUpdate) => api.put(`/empresas/${id}`, p),
  toggle: (id:number) => api.patch(`/empresas/${id}/toggle`),
};

export const clientesApi = {
  list:   (empresaId:number, q?:string) => api.get(`/empresas/${empresaId}/clientes`, { params: { q } }),
  get:    (empresaId:number, id:number) => api.get(`/empresas/${empresaId}/clientes/${id}`),
  create: (empresaId:number, p:ClienteForm) => api.post(`/empresas/${empresaId}/clientes`, p),
  update: (empresaId:number, id:number, p:ClienteUpdate) =>
            api.put(`/empresas/${empresaId}/clientes/${id}`, p),
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   catch (err: any) {
  console.error("PUT error status:", err?.response?.status);
  console.error("PUT error data:", err?.response?.data);
  throw err;
},
  toggle: (empresaId:number, id:number) => api.patch(`/empresas/${empresaId}/clientes/${id}/toggle`),

  // CSV
  bulk:   (empresaId:number, file:File, upsert=true) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/empresas/${empresaId}/clientes/bulk?upsert=${upsert}`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
};
