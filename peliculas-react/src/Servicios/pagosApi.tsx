// src/Servicios/pagosApi.ts
// API para el módulo de pagos (CxC y CxP)

import api from "./api";

// ==================== TIPOS ====================

// Enums
export type EstadoCxc = "Pendiente" | "ParcialmentePagado" | "Pagado" | "Vencido" | "Refinanciado" | "Anulado";
export type EstadoCxp = "Pendiente" | "ParcialmentePagado" | "Pagado" | "Vencido" | "Anulado";
export type EstadoRefinanciamiento = "Pendiente" | "ParcialmentePagado" | "Pagado" | "Vencido" | "Castigado";
export type MetodoPago = "Efectivo" | "Transferencia" | "Cheque" | "TarjetaCredito" | "TarjetaDebito" | "Otro";

// CxC - Documentos
export interface CxcDocumentoListItem {
  id: number;
  numeroDocumento: string;
  empresaId: number;
  empresaNombre: string;
  empresaRnc?: string;
  fechaEmision: string;
  fechaVencimiento: string;
  periodoDesde: string;
  periodoHasta: string;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: EstadoCxc;
  estadoNombre: string;
  refinanciado: boolean;
  diasVencido: number;
}

export interface CxcDocumentoDetalle extends CxcDocumentoListItem {
  notas?: string;
  pagos: CxcPagoItem[];
  consumos: ConsumoItem[];
  refinanciamiento?: RefinanciamientoResumen;
}

export interface CxcPagoItem {
  id: number;
  numeroRecibo: string;
  fecha: string;
  monto: number;
  metodoPago: MetodoPago;
  metodoPagoNombre: string;
  referencia?: string;
  banco?: string;
  registradoPor?: string;
}

export interface ConsumoItem {
  consumoId: number;
  monto: number;
  fecha: string;
  clienteNombre?: string;
  clienteCedula?: string;
}

// CxP - Documentos
export interface CxpDocumentoListItem {
  id: number;
  numeroDocumento: string;
  numeroFacturaProveedor?: string;
  proveedorId: number;
  proveedorNombre: string;
  proveedorRnc?: string;
  tipo: string;
  tipoNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  periodoDesde?: string;
  periodoHasta?: string;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: EstadoCxp;
  estadoNombre: string;
  concepto?: string;
  diasVencido: number;
}

export interface CxpPagoItem {
  id: number;
  numeroComprobante: string;
  fecha: string;
  monto: number;
  metodoPago: MetodoPago;
  metodoPagoNombre: string;
  referencia?: string;
  bancoOrigen?: string;
  registradoPor?: string;
}

// Refinanciamiento
export interface RefinanciamientoListItem {
  id: number;
  numeroRefinanciamiento: string;
  empresaId: number;
  empresaNombre: string;
  documentoOriginal: string;
  fecha: string;
  montoOriginal: number;
  montoPagado: number;
  montoPendiente: number;
  fechaVencimiento: string;
  estado: EstadoRefinanciamiento;
  estadoNombre: string;
  diasVencido: number;
}

export interface RefinanciamientoResumen {
  id: number;
  numeroRefinanciamiento: string;
  montoOriginal: number;
  montoPendiente: number;
  estado: EstadoRefinanciamiento;
}

// Dashboard
export interface DashboardPagos {
  cuentasPorCobrar: {
    totalPendiente: number;
    totalVencido: number;
    totalRefinanciado: number;
    cobradoEsteMes: number;
    proximosAVencer: number;
  };
  cuentasPorPagar: {
    totalPendiente: number;
    totalVencido: number;
    pagadoEsteMes: number;
    proximosAVencer: number;
  };
  fechaConsulta: string;
}

// Estado de cuenta
export interface EstadoCuentaEmpresa {
  empresa: { id: number; nombre: string; rnc: string };
  resumen: {
    totalPendiente: number;
    totalRefinanciado: number;
    totalVencido: number;
    totalDeuda: number;
  };
  documentosPendientes: CxcDocumentoListItem[];
  refinanciamientos: RefinanciamientoListItem[];
}

// Respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  resumen?: Record<string, number>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ==================== API COBROS (CxC) ====================

export const cobrosApi = {
  // Documentos CxC
  async listarDocumentos(params: {
    empresaId?: number;
    estado?: EstadoCxc;
    desde?: string;
    hasta?: string;
    soloVencidos?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<CxcDocumentoListItem>> {
    const { data } = await api.get("/cobros/documentos", { params });
    return data;
  },

  async obtenerDocumento(id: number): Promise<CxcDocumentoDetalle> {
    const { data } = await api.get(`/cobros/documentos/${id}`);
    return data;
  },

  async generarDocumento(dto: {
    empresaId: number;
    periodoDesde: string;
    periodoHasta: string;
    notas?: string;
  }): Promise<{ id: number; numeroDocumento: string; montoTotal: number }> {
    const { data } = await api.post("/cobros/documentos/generar", dto);
    return data;
  },

  // Pagos CxC
  async registrarPago(dto: {
    cxcDocumentoId: number;
    monto: number;
    metodoPago: number;
    referencia?: string;
    banco?: string;
    notas?: string;
  }): Promise<{ id: number; numeroRecibo: string; monto: number }> {
    const { data } = await api.post("/cobros/pagos", dto);
    return data;
  },

  async listarPagos(params: {
    empresaId?: number;
    desde?: string;
    hasta?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<CxcPagoItem>> {
    const { data } = await api.get("/cobros/pagos", { params });
    return data;
  },

  async anularPago(id: number, motivo?: string): Promise<void> {
    await api.post(`/cobros/pagos/${id}/anular`, { motivo });
  },

  // Estado de cuenta
  async estadoCuentaEmpresa(empresaId: number): Promise<EstadoCuentaEmpresa> {
    const { data } = await api.get(`/cobros/empresas/${empresaId}/estado-cuenta`);
    return data;
  },
};

// ==================== API PAGOS PROVEEDOR (CxP) ====================

export const pagosProveedorApi = {
  // Documentos CxP
  async listarDocumentos(params: {
    proveedorId?: number;
    estado?: EstadoCxp;
    desde?: string;
    hasta?: string;
    soloVencidos?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<CxpDocumentoListItem>> {
    const { data } = await api.get("/pagos-proveedor/documentos", { params });
    return data;
  },

  async obtenerDocumento(id: number): Promise<CxpDocumentoListItem & { pagos: CxpPagoItem[]; consumos: ConsumoItem[] }> {
    const { data } = await api.get(`/pagos-proveedor/documentos/${id}`);
    return data;
  },

  async generarDocumento(dto: {
    proveedorId: number;
    periodoDesde: string;
    periodoHasta: string;
    numeroFacturaProveedor?: string;
    concepto?: string;
    notas?: string;
    diasParaPagar?: number;
  }): Promise<{ id: number; numeroDocumento: string; montoTotal: number }> {
    const { data } = await api.post("/pagos-proveedor/consolidar", dto);
    return data;
  },

  async crearDocumentoManual(dto: {
    proveedorId: number;
    monto: number;
    tipo?: number;
    numeroFacturaProveedor?: string;
    fechaEmision?: string;
    fechaVencimiento?: string;
    concepto?: string;
    notas?: string;
  }): Promise<{ id: number; numeroDocumento: string }> {
    const { data } = await api.post("/pagos-proveedor/documentos", dto);
    return data;
  },

  async anularDocumento(id: number, motivo?: string): Promise<void> {
    await api.post(`/pagos-proveedor/documentos/${id}/anular`, { motivo });
  },

  // Pagos CxP
  async registrarPago(dto: {
    cxpDocumentoId: number;
    monto: number;
    metodoPago: number;
    referencia?: string;
    bancoOrigen?: string;
    cuentaDestino?: string;
    notas?: string;
  }): Promise<{ id: number; numeroComprobante: string; monto: number }> {
    const { data } = await api.post("/pagos-proveedor/pagos", dto);
    return data;
  },

  async listarPagos(params: {
    proveedorId?: number;
    desde?: string;
    hasta?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<CxpPagoItem>> {
    const { data } = await api.get("/pagos-proveedor/pagos", { params });
    return data;
  },

  async anularPago(id: number, motivo?: string): Promise<void> {
    await api.post(`/pagos-proveedor/pagos/${id}/anular`, { motivo });
  },

  // Estado de cuenta
  async estadoCuentaProveedor(proveedorId: number): Promise<{
    proveedor: { id: number; nombre: string; rnc: string };
    resumen: { totalPendiente: number; totalVencido: number; documentosPendientes: number };
    documentosPendientes: CxpDocumentoListItem[];
  }> {
    const { data } = await api.get(`/pagos-proveedor/proveedores/${proveedorId}/estado-cuenta`);
    return data;
  },
};

// ==================== API REFINANCIAMIENTO ====================

export const refinanciamientoApi = {
  async listar(params: {
    empresaId?: number;
    estado?: EstadoRefinanciamiento;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<RefinanciamientoListItem>> {
    const { data } = await api.get("/refinanciamiento", { params });
    return data;
  },

  async obtener(id: number): Promise<RefinanciamientoListItem & {
    pagos: { id: number; fecha: string; monto: number; metodoPago: string }[];
    consumos: ConsumoItem[];
  }> {
    const { data } = await api.get(`/refinanciamiento/${id}`);
    return data;
  },

  async crear(dto: {
    cxcDocumentoId: number;
    diasParaVencimiento: number;
    motivo?: string;
    notas?: string;
  }): Promise<{
    id: number;
    numeroRefinanciamiento: string;
    montoOriginal: number;
    clientesRestaurados: number;
    creditoRestaurado: number;
  }> {
    const { data } = await api.post("/refinanciamiento", dto);
    return data;
  },

  async registrarPago(id: number, dto: {
    monto: number;
    metodoPago: number;
    referencia?: string;
    notas?: string;
  }): Promise<{ id: number; monto: number; nuevoSaldo: number }> {
    const { data } = await api.post(`/refinanciamiento/${id}/pagos`, dto);
    return data;
  },

  async castigar(id: number, motivo?: string): Promise<void> {
    await api.post(`/refinanciamiento/${id}/castigar`, { motivo });
  },
};

// ==================== API REPORTES ====================

export const reportesPagosApi = {
  async dashboard(): Promise<DashboardPagos> {
    const { data } = await api.get("/reportes/pagos/dashboard");
    return data;
  },

  async antiguedadCxc(empresaId?: number): Promise<{
    resumen: Record<string, number>;
    detalle: Record<string, CxcDocumentoListItem[]>;
  }> {
    const { data } = await api.get("/reportes/pagos/antiguedad-cxc", { params: { empresaId } });
    return data;
  },

  async antiguedadCxcPorEmpresa(): Promise<{
    data: Array<{
      empresaId: number;
      empresaNombre: string;
      corriente: number;
      de1a30Dias: number;
      de31a60Dias: number;
      de61a90Dias: number;
      mas90Dias: number;
      total: number;
    }>;
    totales: Record<string, number>;
  }> {
    const { data } = await api.get("/reportes/pagos/antiguedad-cxc-por-empresa");
    return data;
  },

  async antiguedadCxp(proveedorId?: number): Promise<{
    resumen: Record<string, number>;
    detalle: Record<string, CxpDocumentoListItem[]>;
  }> {
    const { data } = await api.get("/reportes/pagos/antiguedad-cxp", { params: { proveedorId } });
    return data;
  },

  async historicoCobros(params: { desde?: string; hasta?: string; empresaId?: number }): Promise<{
    resumen: { totalCobros: number; montoTotal: number };
    porDia: Array<{ fecha: string; cantidad: number; monto: number }>;
    porMetodoPago: Array<{ metodoPago: string; cantidad: number; monto: number }>;
  }> {
    const { data } = await api.get("/reportes/pagos/historico-cobros", { params });
    return data;
  },

  async historicoPagos(params: { desde?: string; hasta?: string; proveedorId?: number }): Promise<{
    resumen: { totalPagos: number; montoTotal: number };
    porDia: Array<{ fecha: string; cantidad: number; monto: number }>;
    porMetodoPago: Array<{ metodoPago: string; cantidad: number; monto: number }>;
  }> {
    const { data } = await api.get("/reportes/pagos/historico-pagos", { params });
    return data;
  },

  async flujoCaja(dias?: number): Promise<{
    periodo: { desde: string; hasta: string; dias: number };
    resumen: { totalIngresosEsperados: number; totalEgresosEsperados: number; flujoNetoEsperado: number };
    flujoDiario: Array<{ fecha: string; ingresos: number; egresos: number; neto: number; saldoAcumulado: number }>;
  }> {
    const { data } = await api.get("/reportes/pagos/flujo-caja", { params: { dias } });
    return data;
  },
};

// Método de pago helpers
export const METODOS_PAGO = [
  { value: 0, label: "Efectivo" },
  { value: 1, label: "Transferencia" },
  { value: 2, label: "Cheque" },
  { value: 3, label: "Tarjeta de Crédito" },
  { value: 4, label: "Tarjeta de Débito" },
  { value: 5, label: "Otro" },
];

export const getMetodoPagoLabel = (value: number): string => {
  return METODOS_PAGO.find(m => m.value === value)?.label || "Desconocido";
};