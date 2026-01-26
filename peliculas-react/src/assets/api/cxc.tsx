//import { useParams } from "react-router-dom";
import api from "../api/http";

//cuentas por cobrar por empresas

export interface CxcCuentaRow {
  Id: number;
  clienteId: number;
  rnc: string;
  clienteNombre: string;
  telefono?: string | null;
  email?: string | null;
  limiteCredito: number;
  totalCobrar: number;
  totalDisponible: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  sumTotalCobrar?: number;
  sumTotalDisponible?: number;
  empresaNombre?: string;
}

export async function fetchCxcCuentas(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { data } = await api.get<PagedResult<CxcCuentaRow>>("/cxc/cuentas", { params });
  
  return data;
}

//cuentas por cobrar por clientes

export interface CxcEmpresaClienteRow {
  empresaId: number;
  clienteId: number;
  codigo: string;
  clienteNombre: string;
  cedula: string;
  diaCorte: number;
  saldoOriginal: number;
  totalCobrar: number;
  totalDisponible: number;
}



export async function fetchCxcEmpresaClientes(params: {
    
  empresaId: number;
  search?: string;
  page?: number;
  pageSize?: number;
  
}) {    
  const { empresaId, ...rest } = params;
  const { data } = await api.get<PagedResult<CxcEmpresaClienteRow>>(
    `/cxc/empresa/${empresaId}/clientes`,
    { params: rest }
  );
  
  return data;
}
