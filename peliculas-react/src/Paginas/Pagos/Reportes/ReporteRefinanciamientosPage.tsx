/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/Reportes/ReporteRefinanciamientosPage.tsx

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";
import { useReactToPrint } from "react-to-print";

type Refinanciamiento = {
  id: number;
  numeroRefinanciamiento: string;
  fecha: string;
  montoOriginal: number;
  montoPagado: number;
  montoPendiente: number;
  fechaVencimiento: string | null;
  estado: number;
  estadoNombre: string;
  empresaId: number;
  empresaNombre: string;
  documentoOriginal: string;
  diasRestantes: number;
};

type Empresa = { id: number; nombre: string };
type ResumenEstado = { estado: number; estadoNombre: string; cantidad: number; montoPendiente: number };

export default function ReporteRefinanciamientosPage() {
  const [refinanciamientos, setRefinanciamientos] = useState<Refinanciamiento[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [resumenPorEstado, setResumenPorEstado] = useState<ResumenEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadEmpresas(); }, []);
  useEffect(() => { loadData(); }, [desde, hasta, empresaId, estado, page]);

  const loadEmpresas = async () => {
    try {
      const res = await api.get("/empresas");
      setEmpresas(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, pageSize: 50 };
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (empresaId) params.empresaId = empresaId;
      if (estado) params.estado = estado;
      const res = await api.get("/reportes/refinanciamientos", { params });
      setRefinanciamientos(res.data.data || []);
      setResumen(res.data.resumen || null);
      setResumenPorEstado(res.data.resumenPorEstado || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatCurrency = (v: number | null | undefined) => 
    v == null || isNaN(v) ? "RD$0.00" : `RD$${v.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string | null) => d && !d.startsWith("0001") ? new Date(d).toLocaleDateString("es-DO") : "—";

  const getEstadoColor = (estado: number) => {
    const colors: Record<number, string> = {
      0: "bg-sky-100 text-sky-700",
      1: "bg-green-100 text-green-700",
      2: "bg-amber-100 text-amber-700",
      3: "bg-red-100 text-red-700",
      4: "bg-gray-100 text-gray-700"
    };
    return colors[estado] || "bg-gray-100 text-gray-700";
  };

  const exportToCSV = () => {
    const headers = ["Número","Fecha","Empresa","Doc. Original","Monto Original","Pagado","Pendiente","Vencimiento","Estado"];
    const rows = refinanciamientos.map(r => [
      r.numeroRefinanciamiento, formatDate(r.fecha), r.empresaNombre, r.documentoOriginal,
      r.montoOriginal.toFixed(2), r.montoPagado.toFixed(2), r.montoPendiente.toFixed(2),
      formatDate(r.fechaVencimiento), r.estadoNombre
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `refinanciamientos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: "Reporte_Refinanciamientos" });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1 text-sm">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
            <span className="text-gray-300">/</span>
            <Link to="/pagos/reportes" className="text-gray-400 hover:text-gray-600">Reportes</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Refinanciamientos</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">🔄 Reporte de Refinanciamientos</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} disabled={!refinanciamientos.length} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">📊 CSV</button>
          <button onClick={() => handlePrint()} disabled={!refinanciamientos.length} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">🖨️ PDF</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPage(1); }} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPage(1); }} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select value={empresaId} onChange={e => { setEmpresaId(e.target.value); setPage(1); }} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Todas</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={estado} onChange={e => { setEstado(e.target.value); setPage(1); }} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Todos</option>
              <option value="0">Pendiente</option>
              <option value="1">Pagado</option>
              <option value="2">Parcialmente Pagado</option>
              <option value="3">Vencido</option>
              <option value="4">Castigado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setDesde(""); setHasta(""); setEmpresaId(""); setEstado(""); setPage(1); }} className="w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Limpiar</button>
          </div>
        </div>
      </div>

      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold">{resumen.totalRegistros}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Monto Original</p>
            <p className="text-xl font-bold">{formatCurrency(resumen.totalMontoOriginal)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Pagado</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(resumen.totalMontoPagado)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Pendiente</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(resumen.totalMontoPendiente)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">% Recuperado</p>
            <p className="text-xl font-bold text-purple-600">{resumen.porcentajeRecuperado?.toFixed(1) || 0}%</p>
          </div>
        </div>
      )}

      {resumenPorEstado.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Resumen por Estado</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {resumenPorEstado.map(r => (
              <div key={r.estado} className={`rounded-xl p-4 ${getEstadoColor(r.estado)}`}>
                <p className="text-sm font-medium">{r.estadoNombre}</p>
                <p className="text-2xl font-bold">{r.cantidad}</p>
                <p className="text-sm">{formatCurrency(r.montoPendiente)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={printRef} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-xl font-bold">Reporte de Refinanciamientos</h1>
          <p className="text-gray-500">Generado: {new Date().toLocaleDateString("es-DO")}</p>
        </div>
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div></div>
        ) : !refinanciamientos.length ? (
          <div className="p-12 text-center text-gray-500">Sin resultados</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Número</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Empresa</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Original</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Pagado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Pendiente</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Vencimiento</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {refinanciamientos.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{r.numeroRefinanciamiento}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(r.fecha)}</td>
                    <td className="px-4 py-3 text-sm">{r.empresaNombre}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(r.montoOriginal)}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(r.montoPagado)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-amber-600">{formatCurrency(r.montoPendiente)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {formatDate(r.fechaVencimiento)}
                      {r.diasRestantes < 0 && <span className="text-xs text-red-500 block">Vencido</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(r.estado)}`}>{r.estadoNombre}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-semibold">TOTALES</td>
                  <td className="px-4 py-3 text-right font-bold">{formatCurrency(refinanciamientos.reduce((s,r)=>s+r.montoOriginal,0))}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(refinanciamientos.reduce((s,r)=>s+r.montoPagado,0))}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-700">{formatCurrency(refinanciamientos.reduce((s,r)=>s+r.montoPendiente,0))}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
            <div className="px-6 py-4 border-t flex justify-between print:hidden">
              <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1 border rounded-lg disabled:opacity-50">Anterior</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1 border rounded-lg disabled:opacity-50">Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}