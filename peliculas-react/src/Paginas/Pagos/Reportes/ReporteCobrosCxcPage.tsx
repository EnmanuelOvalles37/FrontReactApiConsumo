/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/Reportes/ReporteCobrosCxcPage.tsx
// Historial de cobros CxC con filtros y exportación a PDF/CSV

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";
import { useReactToPrint } from "react-to-print";

type Cobro = {
  id: number;
  numeroRecibo: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre: string;
  referencia: string | null;
  documentoId: number;
  numeroDocumento: string;
  empresaId: number;
  empresaNombre: string;
  empresaRnc: string | null;
  registradoPor: string | null;
};

type Empresa = {
  id: number;
  nombre: string;
};

type Resumen = {
  totalRegistros: number;
  totalMonto: number;
  promedioMonto: number;
};

const METODOS_PAGO = [
  { value: "", label: "Todos" },
  { value: "0", label: "Efectivo" },
  { value: "1", label: "Transferencia" },
  { value: "2", label: "Cheque" },
  { value: "3", label: "Tarjeta de Crédito" },
  { value: "4", label: "Tarjeta de Débito" },
  { value: "5", label: "Otro" }
];

export default function ReporteCobrosCxcPage() {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filtros
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);
  const [empresaId, setEmpresaId] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  // Referencia para impresión
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    loadCobros();
  }, [desde, hasta, empresaId, metodoPago, page]);

  const loadEmpresas = async () => {
    try {
      const res = await api.get("/empresas");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setEmpresas(data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    }
  };

  const loadCobros = async () => {
    try {
      setLoading(true);
      const params: any = { page, pageSize };
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (empresaId) params.empresaId = empresaId;
      if (metodoPago) params.metodoPago = metodoPago;

      const res = await api.get("/reportes/cobros-cxc", { params });
      setCobros(res.data.data || []);
      setResumen(res.data.resumen || null);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error cargando cobros:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return "RD$0.00";
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-DO");
  };

  const formatDateTime = (date: string | undefined | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("es-DO");
  };

  // Exportar a CSV
  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = [
        "Recibo",
        "Fecha",
        "Empresa",
        "RNC",
        "Documento",
        "Método de Pago",
        "Referencia",
        "Monto",
        "Registrado Por"
      ];

      const rows = cobros.map((c) => [
        c.numeroRecibo,
        formatDateTime(c.fecha),
        c.empresaNombre,
        c.empresaRnc || "",
        c.numeroDocumento,
        c.metodoPagoNombre,
        c.referencia || "",
        c.monto.toFixed(2),
        c.registradoPor || ""
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cobros_cxc_${desde}_${hasta}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // Imprimir/PDF
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Reporte_Cobros_CxC_${desde}_${hasta}`
  });

  const clearFilters = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    setDesde(d.toISOString().split("T")[0]);
    setHasta(new Date().toISOString().split("T")[0]);
    setEmpresaId("");
    setMetodoPago("");
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
            <span className="text-gray-300">/</span>
            <Link to="/pagos/reportes" className="text-gray-400 hover:text-gray-600">Reportes</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Cobros CxC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">💵 Historial de Cobros CxC</h1>
          <p className="text-gray-500 mt-1">Pagos recibidos de empresas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={exporting || cobros.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            📊 Exportar CSV
          </button>
          <button
            onClick={() => handlePrint()}
            disabled={cobros.length === 0}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">🔍 Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => { setDesde(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => { setHasta(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => { setEmpresaId(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => { setMetodoPago(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cobros</p>
                <p className="text-xl font-bold text-gray-900">{resumen.totalRegistros}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Recaudado</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(resumen.totalMonto)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Promedio por Cobro</p>
                <p className="text-xl font-bold text-sky-600">{formatCurrency(resumen.promedioMonto)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla - Área imprimible */}
      <div ref={printRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        {/* Header para impresión */}
        <div className="hidden print:block p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-center">Historial de Cobros CxC</h1>
          <p className="text-center text-gray-500 mt-1">
            Período: {formatDate(desde)} - {formatDate(hasta)}
          </p>
          {resumen && (
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <span>Total Cobros: <strong>{resumen.totalRegistros}</strong></span>
              <span>Total Recaudado: <strong>{formatCurrency(resumen.totalMonto)}</strong></span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : cobros.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin resultados</h3>
            <p className="text-gray-500">No se encontraron cobros con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Recibo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Empresa</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Documento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Método</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Referencia</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cobros.map((cobro) => (
                    <tr key={cobro.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{cobro.numeroRecibo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(cobro.fecha)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{cobro.empresaNombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cobro.numeroDocumento}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">
                          {cobro.metodoPagoNombre}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{cobro.referencia || "—"}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                        {formatCurrency(cobro.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totales */}
                <tfoot className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                      TOTAL PÁGINA:
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                      {formatCurrency(cobros.reduce((sum, c) => sum + (c.monto || 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Paginación */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between print:hidden">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}

        {/* Pie de página para impresión */}
        <div className="hidden print:block p-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Generado el {new Date().toLocaleString("es-DO")}
        </div>
      </div>
    </div>
  );
}