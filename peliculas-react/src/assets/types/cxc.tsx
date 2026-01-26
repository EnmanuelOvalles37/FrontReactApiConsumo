// src/types/cxc.ts
// Reusa el genérico si ya lo definiste en cxp.ts
import type { PagedResult } from "./cxp";



export type CxcItem = {
  id: number;
  clienteId: string;        
  clienteNombre: string;
  fecha: string;            
  documento: string;
  concepto?: string | null;
  monto: number;
  balance: number;
  estado: "Pendiente" | "Parcial" | "Pagado" | string;
};

export type CxcResponse = {
  data: CxcItem[];
  total: number;
  page: number;
  pageSize: number;
  sumBalance: number;
  sumBalanceAll: number;
};
// Movimiento/cobro aplicado a una CxC
export type CxcCobro = {
  id: number;
  cxcId: number;
  fecha: string;                
  tipo: string;                 
  monto: number;
  medioPago: string;
  referencia?: string | null;
  observacion?: string | null;
  usuarioId?: number | null;
};


export type CxcPaged = PagedResult<CxcItem>;


export type CxcVencCliente = {
  clienteId: string;
  clienteNombre: string;
  noVencido: number;
  d0_30: number;
  d31_60: number;
  d61_90: number;
  d90p: number;
  total: number;
  facturas: number;
};


export type CxcVencDetalle = {
  id: number;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  documento: string;
  concepto?: string | null;
  monto: number;
  balance: number;
  dias: number; 
};
