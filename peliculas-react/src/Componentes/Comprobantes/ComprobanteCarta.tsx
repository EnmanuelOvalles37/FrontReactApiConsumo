// src/Componentes/Comprobantes/ComprobanteCarta.tsx
// Comprobante formato carta para impresora normal

import { forwardRef } from "react";
import { type DatosComprobante } from "./ComprobanteTicket";

interface ComprobanteCartaProps {
  datos: DatosComprobante;
}

const ComprobanteCarta = forwardRef<HTMLDivElement, ComprobanteCartaProps>(
  ({ datos }, ref) => {
    const formatCurrency = (value: number) => {
      return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
    };

    const formatDateTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleString("es-DO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const esReverso = datos.tipo === "REVERSO";

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 max-w-2xl mx-auto"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {datos.proveedorNombre}
              </h1>
              {datos.tiendaNombre && (
                <p className="text-gray-600">{datos.tiendaNombre}</p>
              )}
              {datos.cajaNombre && (
                <p className="text-gray-500 text-sm">Caja: {datos.cajaNombre}</p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold ${esReverso ? "text-red-600" : "text-gray-800"}`}>
                {esReverso ? "NOTA DE DEVOLUCIÓN" : "COMPROBANTE DE CONSUMO"}
              </p>
              <p className="text-gray-600">
                No. <span className="font-mono">{datos.id.toString().padStart(8, "0")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Fecha */}
        <div className="mb-6 text-right">
          <p className="text-gray-600">
            <span className="font-semibold">Fecha:</span> {formatDateTime(datos.fecha)}
          </p>
        </div>

        {/* Datos del cliente */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            Datos del Cliente
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Nombre</p>
              <p className="font-semibold">{datos.clienteNombre}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cédula</p>
              <p className="font-semibold">{datos.clienteCedula || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Empresa</p>
              <p className="font-semibold">{datos.empresaNombre}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">RNC Empresa</p>
              <p className="font-semibold">{datos.empresaRnc || "—"}</p>
            </div>
          </div>
        </div>

        {/* Detalle de la transacción */}
        <div className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            Detalle de la Transacción
          </h2>
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2 text-gray-600">Tipo</td>
                <td className={`py-2 text-right font-semibold ${esReverso ? "text-red-600" : ""}`}>
                  {esReverso ? "Devolución" : "Consumo"}
                </td>
              </tr>
              {datos.concepto && (
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Concepto</td>
                  <td className="py-2 text-right">{datos.concepto}</td>
                </tr>
              )}
              {datos.referencia && (
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Referencia</td>
                  <td className="py-2 text-right font-mono">{datos.referencia}</td>
                </tr>
              )}
              {esReverso && datos.motivoReverso && (
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Motivo Devolución</td>
                  <td className="py-2 text-right text-red-600">{datos.motivoReverso}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Monto */}
        <div className={`rounded-lg p-6 mb-6 ${esReverso ? "bg-red-50 border border-red-200" : "bg-sky-50 border border-sky-200"}`}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">
              {esReverso ? "Monto Devuelto:" : "Monto Total:"}
            </span>
            <span className={`text-3xl font-bold ${esReverso ? "text-red-600" : "text-sky-700"}`}>
              {esReverso ? "-" : ""}{formatCurrency(datos.monto)}
            </span>
          </div>
        </div>

        {/* Saldos */}
        {(datos.clienteSaldoAnterior !== undefined || datos.clienteSaldoNuevo !== undefined) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Estado de Cuenta
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {datos.clienteSaldoAnterior !== undefined && (
                <div>
                  <p className="text-gray-500 text-sm">Saldo Anterior</p>
                  <p className="font-semibold text-lg">{formatCurrency(datos.clienteSaldoAnterior)}</p>
                </div>
              )}
              {datos.clienteSaldoNuevo !== undefined && (
                <div>
                  <p className="text-gray-500 text-sm">Saldo Actual</p>
                  <p className="font-bold text-lg text-green-600">{formatCurrency(datos.clienteSaldoNuevo)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Firma y datos adicionales */}
        <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t">
          <div>
            {datos.cajeroNombre && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Atendido por:</span> {datos.cajeroNombre}
              </p>
            )}
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 mt-12 pt-2">
              <p className="text-sm text-gray-500">Firma del Cliente</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-gray-400 text-xs">
          <p>Documento generado el {new Date().toLocaleString("es-DO")}</p>
          <p className="mt-1">Este documento es un comprobante de la transacción realizada.</p>
        </div>
      </div>
    );
  }
);

ComprobanteCarta.displayName = "ComprobanteCarta";

export default ComprobanteCarta;