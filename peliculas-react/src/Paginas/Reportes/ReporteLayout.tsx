// src/Componentes/Reportes/ReporteLayout.tsx
import { type ReactNode, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

interface ReporteLayoutProps {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  filtros?: ReactNode;
  resumen?: ReactNode;
  onExportExcel?: () => void;
  loading?: boolean;
}

export default function ReporteLayout({
  titulo,
  subtitulo,
  children,
  filtros,
  resumen,
  onExportExcel,
  loading = false
}: ReporteLayoutProps) {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: titulo.replace(/\s/g, "_")
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/reportes")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
              {subtitulo && <p className="text-gray-500 text-sm">{subtitulo}</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              📥 Excel
            </button>
          )}
          <button
            onClick={() => handlePrint()}
            disabled={loading}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            🖨️ PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      {filtros && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
          {filtros}
        </div>
      )}

      {/* Contenido imprimible */}
      <div ref={printRef} className="print:p-4">
        {/* Header para impresión */}
        <div className="hidden print:block mb-6">
          <h1 className="text-xl font-bold text-center">{titulo}</h1>
          {subtitulo && <p className="text-center text-gray-600">{subtitulo}</p>}
          <p className="text-center text-sm text-gray-500 mt-1">
            Generado: {new Date().toLocaleString("es-DO")}
          </p>
        </div>

        {/* Resumen */}
        {resumen && !loading && (
          <div className="mb-6">
            {resumen}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando reporte...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  icono?: string;
  color?: "blue" | "green" | "red" | "orange" | "purple" | "gray";
}

export function ResumenCard({ titulo, valor, icono, color = "blue" }: ResumenCardProps) {
  const colores = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200"
  };

  return (
    <div className={`rounded-xl p-4 border ${colores[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icono && <span className="text-lg">{icono}</span>}
        <span className="text-sm font-medium opacity-80">{titulo}</span>
      </div>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}

// Función para formatear moneda
export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "RD$0.00";
  return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Función para formatear fecha
export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-DO");
}

// Función para exportar a CSV
/*export function exportToCSV(data: Record<string, unknown>[], headers: { key: string; label: string }[], filename: string) {
  const headerRow = headers.map(h => h.label).join(",");
  const rows = data.map(item =>
    headers.map(h => {
      const value = item[h.key];
      if (value == null) return "";
      if (typeof value === "string" && value.includes(",")) return `"${value}"`;
      return String(value);
    }).join(",")
  ); */

 export function exportToCSV<T extends object>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string
) {
  const headerRow = headers.map(h => h.label).join(",");

  const rows = data.map(item =>
    headers
      .map(h => {
        const value = item[h.key];
        if (value == null) return "";
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return String(value);
      })
      .join(",")
  );

  const csv = [headerRow, ...rows].join("\n");

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}
  
  
 

// Obtener nombre de método de pago
export function getMetodoPagoNombre(metodo: number): string {
  const metodos: Record<number, string> = {
    0: "Efectivo",
    1: "Transferencia",
    2: "Cheque",
    3: "Tarjeta",
    4: "Depósito"
  };
  return metodos[metodo] || "Otro";
}

// Obtener nombre de estado
export function getEstadoNombre(estado: number): string {
  const estados: Record<number, string> = {
    0: "Pendiente",
    1: "Parcial",
    2: "Pagado",
    3: "Refinanciado",
    4: "Anulado"
  };
  return estados[estado] || "Desconocido";
}

// Obtener color de estado
export function getEstadoColor(estado: number): string {
  const colores: Record<number, string> = {
    0: "bg-amber-100 text-amber-700",
    1: "bg-blue-100 text-blue-700",
    2: "bg-green-100 text-green-700",
    3: "bg-purple-100 text-purple-700",
    4: "bg-gray-100 text-gray-500"
  };
  return colores[estado] || "bg-gray-100 text-gray-500";
}

// Obtener color de rango de antigüedad
export function getRangoColor(diasVencido: number): string {
  if (diasVencido <= 0) return "bg-green-100 text-green-700";
  if (diasVencido <= 30) return "bg-yellow-100 text-yellow-700";
  if (diasVencido <= 60) return "bg-orange-100 text-orange-700";
  if (diasVencido <= 90) return "bg-red-100 text-red-700";
  return "bg-red-200 text-red-800";
}

export function getRangoNombre(diasVencido: number): string {
  if (diasVencido <= 0) return "Vigente";
  if (diasVencido <= 30) return "1-30 días";
  if (diasVencido <= 60) return "31-60 días";
  if (diasVencido <= 90) return "61-90 días";
  return "Más de 90";
}