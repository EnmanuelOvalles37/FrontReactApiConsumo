// types.ts

export type AsignacionInfo = {
  proveedorId: number;
  proveedorNombre?: string;
  tiendaId?: number;
  tiendaNombre?: string;
  cajaId?: number;
  cajaNombre?: string;
  rol?: string;
};

export type User = {
  usuario: string;
  rol: string;
  permisos: string[];
  expiracion?: string;
  // Nuevos campos
  esCajero?: boolean;
  tipoUsuario?: string; // "admin" | "usuario" | "cajero" | "proveedor_admin" | "proveedor_supervisor"
  asignacion?: AsignacionInfo;
};

export type LoginResult = {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    usuario: string;
    rol: string;
    permisos: string[];
    expiracion: string;
    esCajero: boolean;
    tipoUsuario: string;
    asignacion?: AsignacionInfo;
  };
};

// Otros types que puedas necesitar
export type Consumo = {
  id: number;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  clienteCedula: string;
  proveedorId: number;
  proveedorNombre: string;
  tiendaId: number;
  tiendaNombre: string;
  cajaId: number;
  cajaNombre: string;
  monto: number;
  concepto?: string;
  referencia?: string;
  reversado: boolean;
  reversadoUtc?: string;
};

export type Cliente = {
  id: number;
  codigo: string;
  nombre: string;
  cedula?: string;
  grupo: string;
  saldo: number;
  saldoOriginal: number;
  diaCorte: number;
  activo: boolean;
  empresaId: number;
  empresaNombre?: string;
};

export type Empresa = {
  id: number;
  rnc: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  limiteCredito: number;
};

export type Proveedor = {
  id: number;
  rnc: string;
  nombre: string;
  activo: boolean;
};

export type Tienda = {
  id: number;
  proveedorId: number;
  nombre: string;
  activo: boolean;
};

export type Caja = {
  id: number;
  tiendaId: number;
  nombre: string;
  activo: boolean;
};