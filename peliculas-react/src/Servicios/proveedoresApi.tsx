// src/Servicios/proveedoresApi.ts
// API de Proveedores - Actualizada con campos de comisión


import api from "./api";


// Tipos
export type ProveedorTienda = {
  id: number;
  nombre: string;
  activo: boolean;
};

export type ProveedorDetail = {
  id: number;
  nombre: string;
  rnc?: string ;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  contacto?: string | null;
  diasCorte?: number | null;
  porcentajeComision?: number;
  activo: boolean;
  creadoUtc?: string;
  tiendas: ProveedorTienda[];
};

export type ProveedorListItem = {
  id: number;
  nombre: string;
  rnc?: string | null;
  activo: boolean;
  porcentajeComision?: number;
  tiendasCount?: number;
};

export type CreateProveedorDto = {
  nombre: string;
  rnc?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  contacto?: string | null;
  diasCorte?: number | null;
  porcentajeComision?: number;
  activo?: boolean;
};

export type UpdateProveedorDto = {
  nombre: string;
  rnc?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  contacto?: string | null;
  diasCorte?: number | null;
  porcentajeComision?: number;
  activo?: boolean;
};

export type CreateTiendaDto = {
  nombre: string;
};

// API
export const proveedoresApi = {
  // Listar proveedores
  list: async (): Promise<ProveedorListItem[]> => {
    const response = await api.get("/proveedores");
    return response.data.data ?? response.data;
  },

  // Obtener detalle de proveedor
  getDetail: async (id: number): Promise<ProveedorDetail> => {
    const response = await api.get(`/proveedores/${id}`);
    return response.data;
  },

  // Crear proveedor
  create: async (data: CreateProveedorDto): Promise<ProveedorDetail> => {
    const response = await api.post("/proveedores", data);
    return response.data;
  },

  // Actualizar proveedor
  update: async (id: number, data: UpdateProveedorDto): Promise<ProveedorDetail> => {
    const response = await api.put(`/proveedores/${id}`, data);
    return response.data;
  },

  // Eliminar proveedor
  delete: async (id: number): Promise<void> => {
    await api.delete(`/proveedores/${id}`);
  },

  // Toggle estado activo
  toggle: async (id: number): Promise<void> => {
    await api.post(`/proveedores/${id}/toggle`);
  },

  // === TIENDAS ===

  // Crear tienda
  createTienda: async (proveedorId: number, data: CreateTiendaDto): Promise<ProveedorTienda> => {
    const response = await api.post(`/proveedores/${proveedorId}/tiendas`, data);
    return response.data;
  },

  // Eliminar tienda
  deleteTienda: async (proveedorId: number, tiendaId: number): Promise<void> => {
    await api.delete(`/proveedores/${proveedorId}/tiendas/${tiendaId}`);
  },

  // Actualizar tienda
  updateTienda: async (proveedorId: number, tiendaId: number, data: { nombre: string }): Promise<ProveedorTienda> => {
    const response = await api.put(`/proveedores/${proveedorId}/tiendas/${tiendaId}`, data);
    return response.data;
  },

  // Obtener tienda
  getTienda: async (proveedorId: number, tiendaId: number): Promise<ProveedorTienda> => {
    const response = await api.get(`/proveedores/${proveedorId}/tiendas/${tiendaId}`);
    return response.data;
  }
};

export default proveedoresApi;