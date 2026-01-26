/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/CxP/HistorialPagosCxpPage.tsx
// Historial de pagos CxP a proveedores

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";


type Pago = {
  id: number;
  numeroComprobante: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre: string;
  referencia: string | null;
  documentoId: number;
  documentoNumero: string;
  proveedorNombre: string;
  registradoPor: string;
};

type Proveedor = {
  id: number;
  nombre: string;
};

export default function HistorialPagosCxpPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMonto, setTotalMonto] = useState(0);
  
  // Filtros
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProveedores();
    // Fechas por defecto: último mes
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setHasta(hoy.toISOString().split('T')[0]);
    setDesde(inicioMes.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (desde && hasta) loadPagos();
  }, [proveedorId, desde, hasta, page]);

  const loadProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  };

  const loadPagos = async () => {
    try {
      setLoading(true);
      const params: any = { desde, hasta, page, pageSize: 20 };
      if (proveedorId) params.proveedorId = proveedorId;

      const res = await api.get("/cxp/pagos", { params });
      setPagos(res.data.data);
      setTotalMonto(res.data.totalMonto);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDateTime = (date: string) => new Date(date).toLocaleString("es-DO");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/cxp" className="text-gray-400 hover:text-gray-600">CxP</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Historial de Pagos</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">📜 Historial de Pagos</h1>
        <p className="text-gray-500 mt-1">Registro de todos los pagos realizados a proveedores</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
            <select
              value={proveedorId || ""}
              onChange={(e) => { setProveedorId(e.target.value ? Number(e.target.value) : null); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => { setDesde(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => { setHasta(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setProveedorId(null); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
        <span className="text-amber-700 font-medium">Total pagado en período:</span>
        <span className="text-2xl font-bold text-amber-700">{formatCurrency(totalMonto)}</span>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando pagos...</p>
          </div>
        ) : pagos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin pagos</h3>
            <p className="text-gray-500">No hay pagos en el período seleccionado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Comprobante</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Proveedor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Documento</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Método</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Monto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{pago.numeroComprobante}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(pago.fecha)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{pago.proveedorNombre}</td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/pagos/cxp/documentos/${pago.documentoId}`}
                          className="text-sm text-sky-600 hover:underline"
                        >
                          {pago.documentoNumero}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pago.metodoPagoNombre}
                        {pago.referencia && (
                          <span className="block text-xs text-gray-400">{pago.referencia}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-amber-600">
                        {formatCurrency(pago.monto)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pago.registradoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}