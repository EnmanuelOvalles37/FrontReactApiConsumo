// src/Paginas/Pagos/ReporteHistoricoPagosPage.tsx
// Reporte de histórico de pagos a proveedores (CxP)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";

interface Pago {
  id: number;
  numeroRecibo: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre: string;
  referencia: string | null;
  numeroDocumento: string;
  proveedorNombre: string;
}

interface ResumenPorDia {
  fecha: string;
  cantidad: number;
  monto: number;
}

interface ResumenPorMetodo {
  metodoPago: string;
  cantidad: number;
  monto: number;
}

interface ResumenPorProveedor {
  proveedorNombre: string;
  cantidad: number;
  monto: number;
}

export default function ReporteHistoricoPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [porDia, setPorDia] = useState<ResumenPorDia[]>([]);
  const [porMetodo, setPorMetodo] = useState<ResumenPorMetodo[]>([]);
  const [porProveedor, setPorProveedor] = useState<ResumenPorProveedor[]>([]);
  const [resumen, setResumen] = useState({ totalPagos: 0, montoTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const { data: result } = await api.get(`/reportes/pagos/historico-pagos?${params}`);
      setPagos(result.pagos || []);
      setPorDia(result.porDia || []);
      setPorMetodo(result.porMetodoPago || []);
      setPorProveedor(result.porProveedor || []);
      setResumen(result.resumen || { totalPagos: 0, montoTotal: 0 });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-DO");
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-DO");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/pagos" className="hover:text-gray-700">Pagos</Link>
          <span>→</span>
          <Link to="/pagos/reportes" className="hover:text-gray-700">Reportes</Link>
          <span>→</span>
          <span className="text-gray-900">Histórico de Pagos</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Histórico de Pagos a Proveedores</h1>
        <p className="text-sm text-gray-500 mt-1">Detalle de todos los pagos realizados a proveedores</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Buscar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-sm text-gray-500">Total Pagos</p>
          <p className="text-3xl font-bold text-gray-900">{resumen.totalPagos}</p>
        </div>
        <div className="bg-red-50 rounded-2xl shadow p-4">
          <p className="text-sm text-red-600">Monto Total Pagado</p>
          <p className="text-3xl font-bold text-red-700">{formatCurrency(resumen.montoTotal)}</p>
        </div>
        <div className="bg-sky-50 rounded-2xl shadow p-4">
          <p className="text-sm text-sky-600">Promedio por Pago</p>
          <p className="text-3xl font-bold text-sky-700">
            {resumen.totalPagos > 0 ? formatCurrency(resumen.montoTotal / resumen.totalPagos) : "RD$0.00"}
          </p>
        </div>
      </div>

      {/* Resumen por Proveedor */}
      {porProveedor.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Por Proveedor (Top 5)</h2>
          <div className="flex flex-wrap gap-3">
            {porProveedor.slice(0, 5).map((p) => (
              <div key={p.proveedorNombre} className="bg-gray-50 rounded-xl px-4 py-2">
                <p className="text-sm text-gray-600">{p.proveedorNombre}</p>
                <p className="font-bold text-gray-900">{formatCurrency(p.monto)}</p>
                <p className="text-xs text-gray-500">{p.cantidad} pagos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen por Método de Pago */}
      {porMetodo.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Por Método de Pago</h2>
          <div className="flex flex-wrap gap-3">
            {porMetodo.map((m) => (
              <div key={m.metodoPago} className="bg-gray-50 rounded-xl px-4 py-2">
                <p className="text-sm text-gray-600">{m.metodoPago}</p>
                <p className="font-bold text-gray-900">{formatCurrency(m.monto)}</p>
                <p className="text-xs text-gray-500">{m.cantidad} pagos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Pagos */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Detalle de Pagos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Recibo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Proveedor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Documento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Método</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Referencia</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sky-600">{pago.numeroRecibo}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(pago.fecha)}</td>
                  <td className="px-4 py-3">{pago.proveedorNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{pago.numeroDocumento}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {pago.metodoPagoNombre}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{pago.referencia || "-"}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-700">
                    {formatCurrency(pago.monto)}
                  </td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay pagos en el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen por Día */}
      {porDia.length > 0 && (
        <div className="bg-white rounded-2xl shadow overflow-hidden mt-6">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Resumen por Día</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Cantidad</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {porDia.map((dia) => (
                  <tr key={dia.fecha} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(dia.fecha)}</td>
                    <td className="px-4 py-3 text-right">{dia.cantidad}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-700">
                      {formatCurrency(dia.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}