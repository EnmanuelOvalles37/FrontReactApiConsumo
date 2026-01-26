/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Reportes/ReporteAntiguedadCxpPage.tsx
import { useState, useEffect } from "react";

import ReporteLayout, { 
  formatCurrency, 
  formatDate, 
  exportToCSV,
  getEstadoNombre,
  //getEstadoColor,
  getRangoColor,
  getRangoNombre
} from "../Reportes/ReporteLayout";
import api from "../../Servicios/api";

interface Documento {
  id: number;
  numeroDocumento: string;
  proveedorNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoBruto: number;
  montoComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  diasVencido: number;
}

interface Proveedor { id: number; nombre: string; }

export default function ReporteAntiguedadCxpPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Documento[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [proveedorId, setProveedorId] = useState<string>("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    api.get("/reportes/listas/proveedores").then(r => setProveedores(r.data));
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (proveedorId) params.append("proveedorId", proveedorId);
      
      const res = await api.get(`/reportes/antiguedad-cxp?${params}`);
      setData(res.data.data);
      setResumen(res.data.resumen);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarReporte(); }, []);

  const handleExportExcel = () => {
    exportToCSV(data.map(d => ({
      ...d,
      estadoNombre: getEstadoNombre(d.estado),
      rangoNombre: getRangoNombre(d.diasVencido),
      fechaEmisionFormato: formatDate(d.fechaEmision),
      fechaVencimientoFormato: formatDate(d.fechaVencimiento)
    })), [
      { key: "numeroDocumento", label: "Documento" },
      { key: "proveedorNombre", label: "Proveedor" },
      { key: "fechaEmisionFormato", label: "Emision" },
      { key: "fechaVencimientoFormato", label: "Vencimiento" },
      { key: "diasVencido", label: "Dias Vencido" },
      { key: "rangoNombre", label: "Rango" },
      { key: "montoBruto", label: "Bruto" },
      { key: "montoComision", label: "Comision" },
      { key: "montoTotal", label: "Total" },
      { key: "montoPagado", label: "Pagado" },
      { key: "montoPendiente", label: "Pendiente" },
      { key: "estadoNombre", label: "Estado" }
    ], "Reporte_Antiguedad_CxP");
  };

  return (
    <ReporteLayout
      titulo="Antiguedad CxP"
      subtitulo="Analisis de vencimiento de cuentas por pagar"
      loading={loading}
      onExportExcel={handleExportExcel}
      filtros={
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
            <select
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg min-w-[200px]"
            >
              <option value="">Todos</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <button
            onClick={cargarReporte}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Buscar
          </button>
        </div>
      }
      resumen={
        resumen && (
          <div className="space-y-4">
            {/* Resumen por rango */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {resumen.porRango?.map((r: any) => (
                <div key={r.rango} className={`rounded-xl p-4 border ${
                  r.rango === "Vigente" ? "bg-green-50 border-green-200" :
                  r.rango === "1-30 dias" ? "bg-yellow-50 border-yellow-200" :
                  r.rango === "31-60 dias" ? "bg-orange-50 border-orange-200" :
                  r.rango === "61-90 dias" ? "bg-red-50 border-red-200" :
                  "bg-red-100 border-red-300"
                }`}>
                  <p className="text-sm font-medium text-gray-600">{r.rango}</p>
                  <p className="text-xl font-bold">{formatCurrency(r.monto)}</p>
                  <p className="text-xs text-gray-500">{r.cantidad} docs</p>
                </div>
              ))}
            </div>
            {/* Total */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-orange-600">Total Documentos: {resumen.totalDocumentos}</p>
                <p className="text-sm text-purple-600">Comision Ganada: {formatCurrency(resumen.totalComision)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-600">Total Por Pagar</p>
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(resumen.totalPendiente)}</p>
              </div>
            </div>
          </div>
        )
      }
    >
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <span className="text-4xl mb-4 block">No hay documentos pendientes</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Documento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Proveedor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Vencimiento</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Dias</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Rango</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Comision</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Pagado</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{d.numeroDocumento}</td>
                  <td className="px-4 py-3 text-gray-600">{d.proveedorNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(d.fechaVencimiento)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${d.diasVencido > 0 ? "text-red-600" : "text-green-600"}`}>
                      {d.diasVencido > 0 ? `+${d.diasVencido}` : d.diasVencido}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRangoColor(d.diasVencido)}`}>
                      {getRangoNombre(d.diasVencido)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(d.montoComision)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(d.montoTotal)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatCurrency(d.montoPagado)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">{formatCurrency(d.montoPendiente)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={5} className="px-4 py-3 text-right">Totales:</td>
                <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(resumen?.totalComision)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(data.reduce((s, d) => s + d.montoTotal, 0))}</td>
                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(data.reduce((s, d) => s + d.montoPagado, 0))}</td>
                <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(resumen?.totalPendiente)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </ReporteLayout>
  );
}