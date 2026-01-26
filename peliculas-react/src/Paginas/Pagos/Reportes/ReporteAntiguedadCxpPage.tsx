/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/Reportes/ReporteAntiguedadCxpPage.tsx

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";
import { useReactToPrint } from "react-to-print";

type Documento = {
  id: number;
  numeroDocumento: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoBruto: number;
  montoComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estadoNombre: string;
  proveedorNombre: string;
  diasVencido: number;
  rangoAntiguedad: string;
};

type ResumenRango = { rango: string; cantidad: number; montoPendiente: number; totalComision: number };
type Proveedor = { id: number; nombre: string };

export default function ReporteAntiguedadCxpPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [resumenPorRango, setResumenPorRango] = useState<ResumenRango[]>([]);
  const [loading, setLoading] = useState(true);
  const [proveedorId, setProveedorId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadProveedores(); }, []);
  useEffect(() => { loadData(); }, [proveedorId]);

  const loadProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (proveedorId) params.proveedorId = proveedorId;
      const res = await api.get("/reportes/antiguedad-cxp", { params });
      setDocumentos(res.data.data || []);
      setResumen(res.data.resumen || null);
      setResumenPorRango(res.data.resumenPorRango || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatCurrency = (v: number | null | undefined) => 
    v == null || isNaN(v) ? "RD$0.00" : `RD$${v.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("es-DO") : "—";

  const getRangoColor = (rango: string) => {
    const colors: Record<string, string> = {
      "Vigente": "bg-green-100 text-green-700",
      "1-30 días": "bg-yellow-100 text-yellow-700",
      "31-60 días": "bg-orange-100 text-orange-700",
      "61-90 días": "bg-red-100 text-red-700",
      "Más de 90 días": "bg-red-200 text-red-800"
    };
    return colors[rango] || "bg-gray-100 text-gray-700";
  };

  const exportToCSV = () => {
    const headers = ["Documento","Proveedor","Vencimiento","Días","Rango","Bruto","Comisión","Neto","Pagado","Pendiente"];
    const rows = documentos.map(d => [
      d.numeroDocumento, d.proveedorNombre, formatDate(d.fechaVencimiento),
      d.diasVencido.toString(), d.rangoAntiguedad, d.montoBruto.toFixed(2),
      d.montoComision.toFixed(2), d.montoTotal.toFixed(2), d.montoPagado.toFixed(2), d.montoPendiente.toFixed(2)
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `antiguedad_cxp_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: "Antiguedad_CxP" });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1 text-sm">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
            <span className="text-gray-300">/</span>
            <Link to="/pagos/reportes" className="text-gray-400 hover:text-gray-600">Reportes</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Antigüedad CxP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">📈 Antigüedad de Cuentas por Pagar</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} disabled={!documentos.length} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">📊 CSV</button>
          <button onClick={() => handlePrint()} disabled={!documentos.length} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">🖨️ PDF</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Proveedor</label>
            <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Todos los proveedores</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {resumenPorRango.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {resumenPorRango.map(r => (
            <div key={r.rango} className={`rounded-xl p-4 ${getRangoColor(r.rango)}`}>
              <p className="text-sm font-medium">{r.rango}</p>
              <p className="text-2xl font-bold">{r.cantidad}</p>
              <p className="text-sm">{formatCurrency(r.montoPendiente)}</p>
            </div>
          ))}
        </div>
      )}

      {resumen && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="grid grid-cols-3 gap-6">
            <div><p className="text-amber-100">Total Documentos</p><p className="text-3xl font-bold">{resumen.totalDocumentos}</p></div>
            <div><p className="text-amber-100">Total por Pagar</p><p className="text-3xl font-bold">{formatCurrency(resumen.totalPendiente)}</p></div>
            <div><p className="text-amber-100">Comisión Ganada</p><p className="text-3xl font-bold">{formatCurrency(resumen.totalComision)}</p></div>
          </div>
        </div>
      )}

      <div ref={printRef} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-xl font-bold">Antigüedad - Cuentas por Pagar</h1>
          <p className="text-gray-500">{new Date().toLocaleDateString("es-DO")}</p>
        </div>
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto"></div></div>
        ) : !documentos.length ? (
          <div className="p-12 text-center text-gray-500">Sin documentos pendientes</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Documento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Proveedor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Vencimiento</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Días</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Rango</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Comisión</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documentos.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{d.numeroDocumento}</td>
                  <td className="px-4 py-3 text-sm">{d.proveedorNombre}</td>
                  <td className="px-4 py-3 text-sm text-center">{formatDate(d.fechaVencimiento)}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={d.diasVencido > 0 ? "text-red-600 font-semibold" : "text-green-600"}>{d.diasVencido}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRangoColor(d.rangoAntiguedad)}`}>{d.rangoAntiguedad}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(d.montoComision)}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-amber-600">{formatCurrency(d.montoPendiente)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-3 font-semibold text-right">TOTALES:</td>
                <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(documentos.reduce((s,d)=>s+(d.montoComision||0),0))}</td>
                <td className="px-4 py-3 text-right font-bold text-amber-700">{formatCurrency(documentos.reduce((s,d)=>s+(d.montoPendiente||0),0))}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}