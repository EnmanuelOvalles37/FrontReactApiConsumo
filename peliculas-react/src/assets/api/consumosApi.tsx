// Servicios/consumosApi.ts

import api from "../../Servicios/api";


export type EmpresaLite = { id:number; nombre:string };
export type ClienteLite = {
  id:number; codigo:string; nombre:string; saldo:number; activo:boolean;
};
export type ProveedorLite = { id:number; nombre:string; activo:boolean };

export type ConsumoCreate = {
  empresaId: number;
  clienteId: number;
  proveedorId: number;
  fecha: string;     // ISO (YYYY-MM-DD) o ISO completo
  monto: number;
  concepto?: string;
  referencia?: string;
};

export const consumosApi = {
  empresas: () => api.get<EmpresaLite[]>("/empresas", { params: { pageSize: 500 } }).then(r => r.data ?? r.data),
  clientes: (empresaId:number) => api.get<ClienteLite[]>(`/empresas/${empresaId}/clientes`).then(r => r.data),
  proveedores: () => api.get<ProveedorLite[]>("/proveedores").then(r => r.data ?? r.data),
  crear: (p:ConsumoCreate) => api.post("/consumos", p),
  getById: (id: number) => api.get<ConsumoDetailDto>(`/consumos/${id}`).then(r => r.data),
  reversar: (id: number) => api.post(`/consumos/${id}/reversar`, {}),
};

export type ConsumoDetailDto = {
  id: number;
  empresaId: number; empresa: string;
  clienteId: number; cliente: string;
  proveedorId: number; proveedor: string;
  fecha: string;
  monto: number;
  concepto?: string | null;
  referencia?: string | null;
  reversado: boolean;
  creadoUtc?: string | null;
};


