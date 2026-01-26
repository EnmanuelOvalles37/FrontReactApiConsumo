// src/Componentes/Comprobantes/ComprobanteTicket.tsx
// Comprobante formato ticket 80mm para impresora térmica

import { forwardRef } from "react";

export type DatosComprobante = {
  // Tipo de comprobante
  tipo: "CONSUMO" | "REVERSO";
  
  // Datos de la transacción
  id: number;
  fecha: string;
  monto: number;
  concepto?: string | null;
  referencia?: string | null;
  
  // Datos del cliente
  clienteNombre: string;
  clienteCedula?: string | null;
  clienteSaldoAnterior?: number;
  clienteSaldoNuevo?: number;
  
  // Datos de la empresa
  empresaNombre?: string | null; 
  empresaRnc?: string | null;
  
  // Datos del proveedor
  proveedorNombre: string;
  tiendaNombre?: string | null;
  cajaNombre?: string | null;
  
  // Datos del cajero
  cajeroNombre?: string | null;
  
  // Para reversos
  motivoReverso?: string | null;
};

interface ComprobanteTicketProps {
  datos: DatosComprobante;
}

const ComprobanteTicket = forwardRef<HTMLDivElement, ComprobanteTicketProps>(
  ({ datos }, ref) => {
    const formatCurrency = (value: number) => {
      return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("es-DO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    const esReverso = datos.tipo === "REVERSO";

    return (
      <div
        ref={ref}
        className="bg-white text-black font-mono text-xs"
        style={{
          width: "80mm",
          padding: "4mm",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
          <p className="text-sm font-bold">{datos.proveedorNombre}</p>
          {datos.tiendaNombre && (
            <p className="text-xs">{datos.tiendaNombre}</p>
          )}
          {datos.cajaNombre && (
            <p className="text-xs">Caja: {datos.cajaNombre}</p>
          )}
        </div>

        {/* Tipo de documento */}
        <div className="text-center py-2 border-b border-dashed border-gray-400 mb-2">
          <p className={`text-base font-bold ${esReverso ? "text-red-600" : ""}`}>
            {esReverso ? "*** DEVOLUCIÓN ***" : "COMPROBANTE DE CONSUMO"}
          </p>
          <p className="text-xs">No. {datos.id.toString().padStart(8, "0")}</p>
        </div>

        {/* Fecha y hora */}
        <div className="flex justify-between text-xs mb-2">
          <span>Fecha: {formatDate(datos.fecha)}</span>
          <span>Hora: {formatTime(datos.fecha)}</span>
        </div>

        {/* Línea divisora */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Datos del cliente */}
        <div className="mb-2">
          <p className="font-bold text-xs mb-1">CLIENTE:</p>
          <p>{datos.clienteNombre}</p>
          {datos.clienteCedula && (
            <p>Cédula: {datos.clienteCedula}</p>
          )}
          <p>Empresa: {datos.empresaNombre}</p>
          {datos.empresaRnc && (
            <p>RNC: {datos.empresaRnc}</p>
          )}
        </div>

        {/* Línea divisora */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Detalle */}
        <div className="mb-2">
          <p className="font-bold text-xs mb-1">DETALLE:</p>
          {datos.concepto && (
            <p>Concepto: {datos.concepto}</p>
          )}
          {datos.referencia && (
            <p>Ref: {datos.referencia}</p>
          )}
          {esReverso && datos.motivoReverso && (
            <p className="text-red-600">Motivo: {datos.motivoReverso}</p>
          )}
        </div>

        {/* Monto */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <div className="text-center py-2">
          <p className="text-xs">{esReverso ? "MONTO DEVUELTO:" : "MONTO:"}</p>
          <p className={`text-xl font-bold ${esReverso ? "text-red-600" : ""}`}>
            {esReverso ? "-" : ""}{formatCurrency(datos.monto)}
          </p>
        </div>

        {/* Saldos */}
        {(datos.clienteSaldoAnterior !== undefined || datos.clienteSaldoNuevo !== undefined) && (
          <>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="text-xs">
              {datos.clienteSaldoAnterior !== undefined && (
                <div className="flex justify-between">
                  <span>Saldo Anterior:</span>
                  <span>{formatCurrency(datos.clienteSaldoAnterior)}</span>
                </div>
              )}
              {datos.clienteSaldoNuevo !== undefined && (
                <div className="flex justify-between font-bold">
                  <span>Saldo Actual:</span>
                  <span>{formatCurrency(datos.clienteSaldoNuevo)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Cajero */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <div className="text-xs">
          {datos.cajeroNombre && (
            <p>Atendido por: {datos.cajeroNombre}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-gray-400 mt-2 pt-2 text-center">
          <p className="text-xs">¡Gracias por su preferencia!</p>
          <p className="text-xs mt-1">
            {new Date().toLocaleDateString("es-DO")} {new Date().toLocaleTimeString("es-DO")}
          </p>
        </div>

        {/* Espacio para corte */}
        <div className="h-4"></div>
      </div>
    );
  }
);

ComprobanteTicket.displayName = "ComprobanteTicket";

export default ComprobanteTicket;