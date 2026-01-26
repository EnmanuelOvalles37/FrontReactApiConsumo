/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Reportes/ReportePagosCxpPage.tsx
import { useState, useEffect } from "react";
//import axios from "axios";
import ReporteLayout, { 
  ResumenCard, 
  formatCurrency, 
  formatDate, 
  exportToCSV,
  getMetodoPagoNombre
} from "../Reportes/ReporteLayout";
import api from "../../Servicios/api";

interface Pago {
  id: number;
  numeroComprobante: string;
  fecha: string;
  numeroDocumento: string;
  proveedorNombre: string;
  monto: number;
  metodoPago: number;
  referencia: string;
  bancoOrigen: string;
}

interface Proveedor { id: number; nombre: string; }

export default function ReportePagosCxpPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Pago[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);
  const [proveedorId, setProveedorId] = useState<string>("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    api.get("/reportes/listas/proveedores").then(r => setProveedores(r.data));
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("desde", desde);
      params.append("hasta", hasta);
      if (proveedorId) params.append("proveedorId", proveedorId);
      
      const res = await api.get(`/reportes/pagos-cxp?${params}`);
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
    exportToCSV(data.map(p => ({
      ...p,
      metodoPagoNombre: getMetodoPagoNombre(p.metodoPago),
      fechaFormato: formatDate(p.fecha)
    })), [
      { key: "numeroComprobante", label: "Comprobante" },
      { key: "fechaFormato", label: "Fecha" },
      { key: "numeroDocumento", label: "Documento" },
      { key: "proveedorNombre", label: "Proveedor" },
      { key: "monto", label: "Monto" },
      { key: "metodoPagoNombre", label: "Método" },
      { key: "referencia", label: "Referencia" },
      { key: "bancoOrigen", label: "Banco" }
    ], "Reporte_Pagos_CxP");
  };

  return (
    <ReporteLayout
      titulo="💸 Pagos CxP"
      subtitulo={`Del ${formatDate(desde)} al ${formatDate(hasta)}`}
      loading={loading}
      onExportExcel={handleExportExcel}
      filtros={
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
            <select
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg min-w-[180px]"
            >
              <option value="">Todos</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <button
            onClick={cargarReporte}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            🔍 Buscar
          </button>
        </div>
      }
      resumen={
        resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResumenCard titulo="Total Pagos" valor={resumen.totalPagos} icono="📝" color="blue" />
            <ResumenCard titulo="Monto Pagado" valor={formatCurrency(resumen.montoTotal)} icono="💸" color="orange" />
            {resumen.porMetodo?.map((m: any) => (
              <ResumenCard 
                key={m.metodo} 
                titulo={m.metodo} 
                valor={formatCurrency(m.monto)} 
                icono="💳" 
                color="gray" 
              />
            ))}
          </div>
        )
      }
    >
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <span className="text-4xl mb-4 block">📭</span>
          No hay pagos en el período seleccionado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Comprobante</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Documento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Proveedor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Método</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Referencia</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{p.numeroComprobante}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(p.fecha)}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">{p.numeroDocumento}</td>
                  <td className="px-4 py-3 text-gray-900">{p.proveedorNombre}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {getMetodoPagoNombre(p.metodoPago)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.referencia || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">{formatCurrency(p.monto)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={6} className="px-4 py-3 text-right">Total Pagado:</td>
                <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(resumen?.montoTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </ReporteLayout>
  );
}