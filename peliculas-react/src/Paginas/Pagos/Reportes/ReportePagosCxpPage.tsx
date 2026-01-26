/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/Reportes/ReportePagosCxpPage.tsx

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";
import { useReactToPrint } from "react-to-print";

type Pago = {
  id: number;
  numeroComprobante: string;
  fecha: string;
  monto: number;
  metodoPagoNombre: string;
  referencia: string | null;
  numeroDocumento: string;
  proveedorNombre: string;
  proveedorRnc: string | null;
  registradoPor: string | null;
};

type Proveedor = { id: number; nombre: string };
type Resumen = { totalRegistros: number; totalMonto: number; promedioMonto: number };

const METODOS_PAGO = [
  { value: "", label: "Todos" },
  { value: "0", label: "Efectivo" },
  { value: "1", label: "Transferencia" },
  { value: "2", label: "Cheque" }
];

export default function ReportePagosCxpPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);
  const [proveedorId, setProveedorId] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadProveedores(); }, []);
  useEffect(() => { loadPagos(); }, [desde, hasta, proveedorId, metodoPago, page]);

  const loadProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const loadPagos = async () => {
    try {
      setLoading(true);
      const params: any = { page, pageSize: 50 };
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (proveedorId) params.proveedorId = proveedorId;
      if (metodoPago) params.metodoPago = metodoPago;
      const res = await api.get("/reportes/pagos-cxp", { params });
      setPagos(res.data.data || []);
      setResumen(res.data.resumen || null);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatCurrency = (v: number | null | undefined) => 
    v == null || isNaN(v) ? "RD$0.00" : `RD$${v.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString("es-DO") : "—";
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("es-DO") : "—";

  const exportToCSV = () => {
    const headers = ["Comprobante","Fecha","Proveedor","Documento","Método","Referencia","Monto"];
    const rows = pagos.map(p => [p.numeroComprobante, formatDateTime(p.fecha), p.proveedorNombre, p.numeroDocumento, p.metodoPagoNombre, p.referencia||"", p.monto.toFixed(2)]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pagos_cxp_${desde}_${hasta}.csv`;
    link.click();
  };

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: `Pagos_CxP_${desde}_${hasta}` });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1 text-sm">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
            <span className="text-gray-300">/</span>
            <Link to="/pagos/reportes" className="text-gray-400 hover:text-gray-600">Reportes</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Pagos CxP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">💳 Historial de Pagos CxP</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} disabled={!pagos.length} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">📊 CSV</button>
          <button onClick={() => handlePrint()} disabled={!pagos.length} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">🖨️ PDF</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select value={proveedorId} onChange={e => { setProveedorId(e.target.value); setPage(1); }} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Todos</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
            <select value={metodoPago} onChange={e => { setMetodoPago(e.target.value); setPage(1); }} className="w-full px-3 py-2 border rounded-lg">
              {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setDesde(new Date(Date.now()-30*24*60*60*1000).toISOString().split("T")[0]); setHasta(new Date().toISOString().split("T")[0]); setProveedorId(""); setMetodoPago(""); setPage(1); }} className="w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Limpiar</button>
          </div>
        </div>
      </div>

      {resumen && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4"><p className="text-sm text-gray-500">Total Pagos</p><p className="text-xl font-bold">{resumen.totalRegistros}</p></div>
          <div className="bg-white rounded-xl border p-4"><p className="text-sm text-gray-500">Total Pagado</p><p className="text-xl font-bold text-amber-600">{formatCurrency(resumen.totalMonto)}</p></div>
          <div className="bg-white rounded-xl border p-4"><p className="text-sm text-gray-500">Promedio</p><p className="text-xl font-bold text-sky-600">{formatCurrency(resumen.promedioMonto)}</p></div>
        </div>
      )}

      <div ref={printRef} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-xl font-bold">Historial de Pagos CxP</h1>
          <p className="text-gray-500">Período: {formatDate(desde)} - {formatDate(hasta)}</p>
        </div>
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto"></div></div>
        ) : !pagos.length ? (
          <div className="p-12 text-center text-gray-500">Sin resultados</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Comprobante</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Proveedor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.numeroComprobante}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(p.fecha)}</td>
                    <td className="px-4 py-3 text-sm">{p.proveedorNombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.numeroDocumento}</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{p.metodoPagoNombre}</span></td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-amber-600">{formatCurrency(p.monto)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr><td colSpan={5} className="px-4 py-3 text-right font-semibold">TOTAL:</td><td className="px-4 py-3 text-right font-bold text-amber-700">{formatCurrency(pagos.reduce((s,p)=>s+(p.monto||0),0))}</td></tr>
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