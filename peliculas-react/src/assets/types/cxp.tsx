// src/types/cxp.ts
export type CxpItem = {
  id: number;
  proveedorId: string;            // RNC (string)
  proveedorNombre: string;
  fecha: string;                  // ISO date string
  documento: string;
  concepto?: string | null;
  monto: number;
  balance: number;
  estado: "Pendiente" | "Parcial" | "Pagado" | string;
};

export type CxpResponse = {
  data: CxpItem[];
  total: number;
  page: number;
  pageSize: number;
  sumBalance: number;
  sumBalanceAll: number;
};

export type CxpPago = {
  id: number;
  cxpId: number;
  fecha: string;          // ISO
  tipo: string;           // 'ABONO'
  monto: number;
  medioPago: string;
  referencia?: string | null;
  observacion?: string | null;
  usuarioId?: number | null;
};

export type PagedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  sumMonto?: number;
};

export type CxpVencProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  noVencido: number;
  d0_30: number;
  d31_60: number;
  d61_90: number;
  d90p: number;
  total: number;
  facturas: number;
};

export type CxpVencDetalle = {
  id: number;
  proveedorId: string;
  proveedorNombre: string;
  fecha: string;
  documento: string;
  concepto?: string | null;
  monto: number;
  balance: number;
  dias: number;
};
