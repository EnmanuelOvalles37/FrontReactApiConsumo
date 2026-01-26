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