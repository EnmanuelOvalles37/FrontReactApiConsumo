export type ClienteMatch = {
  clienteId: number;
  empresaId: number;
  empresaNombre: string;
  nombre: string;
  saldo: number;
};

export type ClienteBusquedaGlobal = {
  cedula: string;
  matches: ClienteMatch[];
};

export type Opcion = { id: number; nombre: string };

export type RegistrarConsumoDto = {
  clienteId: number;
  proveedorId: number;
  tiendaId: number;
  cajaId: number;
  monto: number;
  nota?: string;
};