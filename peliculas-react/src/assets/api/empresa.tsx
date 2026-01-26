//import axios from "axios";
import api from "./http";


export type EmpresaDto = {
  id: number;
  rnc: string;
  nombre: string;
  creadoEn?: string | null;
  activo?: boolean;
  empleados?: number;
  empleadosCount: number;
};

export type Paged<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type EmpleadoDto = {
  id: number;
  codigo: string | null;
  nombre: string | null;
  cedula?: string | null;
  grupo?: string | null;
  activo: boolean;
  saldo: number;
};

// ------- Detalle y empleados --------
export type EmpresaDetailDto = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activo: any;
  id: number;
  rnc: string;
  nombre: string;
  creadoEn?: string | null;
  empleadosCount: number;
  empresa: EmpresaDto;
  empleados: EmpleadoDto[];
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  limiteCredito: number;
  diaCorte?: number;
};

export type ClienteRow = {
  id: number;        // Id cliente
  codigo: string;
  cedula: string;
  nombre: string;
  saldo: number;
};

export async function fetchEmpresas(params: { search?: string; page?: number; pageSize?: number }) {
  const { data } = await api.get("/empresas", { params });
  return data as { data: EmpresaDto[]; total: number; page: number; pageSize: number };
}

export async function createEmpresa(payload: { rnc: string; nombre: string }) {
  const { data } = await api.post<EmpresaDto>("/empresas", payload);
  return data;
}

export async function fetchEmpresaById(id: number) {
  const { data } = await api.get<EmpresaDto>(`/empresas/${id}`);
  return data;
}

export async function fetchEmpleadosByEmpresa(
  id: number,
  params: { search?: string; page?: number; pageSize?: number }
) {
  const res = await api.get<Paged<EmpleadoDto>>(`/empresas/${id}/empleados`, { params });
  return res.data;
}

export async function attachEmpleado(idEmpresa: number, payload: { clienteId: number }) {
  await api.post(`/empresas/${idEmpresa}/empleados`, payload);
}


  export async function fetchEmpresaDetail(id: number) {
  const res = await api.get<EmpresaDetailDto>(`/empresas/${id}`);
  return res.data; 
}
