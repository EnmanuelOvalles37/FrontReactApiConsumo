// src/Paginas/Backoffice/ReporteCajerosPage.tsx
// Reporte de consumos por cajero - Vista Backoffice (Proveedor)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

// Coincide con ReporteCajeroDto del backend
interface CajeroReporte {
  cajeroId: number;
  cajeroNombre: string;
  totalConsumos: number;
  montoTotal: number;
  promedioConsumo: number;
  primerConsumo: string | null;
  ultimoConsumo: string | null;
}

interface ConsumoDetalle {
  id: number;
  fecha: string;
  clienteNombre: string;
  clienteCodigo: string;
  empresaNombre: string;
  concepto: string;
  monto: number;
  reversado: boolean;
}

export default function ReporteCajerosPage() {
  const navigate = useNavigate();
  const [cajeros, setCajeros] = useState<CajeroReporte[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros de fecha
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Detalle de cajero seleccionado
  const [cajeroSeleccionado, setCajeroSeleccionado] = useState<number | null>(null);
  const [consumosDetalle, setConsumosDetalle] = useState<ConsumoDetalle[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    cargarReporte();
  }, [desde, hasta]);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const res = await api.get("/backoffice/reporte/por-cajero", {
        params: { desde, hasta }
      });
      setCajeros(res.data.data || []);
    } catch (error) {
      console.error("Error cargando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleCajero = async (cajeroId: number) => {
    if (cajeroSeleccionado === cajeroId) {
      setCajeroSeleccionado(null);
      setConsumosDetalle([]);
      return;
    }

    try {
      setLoadingDetalle(true);
      setCajeroSeleccionado(cajeroId);
      const res = await api.get(`/backoffice/cajeros/${cajeroId}/consumos`, {
        params: { desde, hasta }
      });
      setConsumosDetalle(res.data || []);
    } catch (error) {
      console.error("Error cargando detalle:", error);
      setConsumosDetalle([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) =>
    `RD$${(value ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-DO");
  };

  const totales = {
    cajeros: cajeros.length,
    consumos: cajeros.reduce((sum, c) => sum + (c.totalConsumos ?? 0), 0),
    monto: cajeros.reduce((sum, c) => sum + (c.montoTotal ?? 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard-backoffice")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-xl font-bold">Reporte por Cajero</h1>
              <p className="text-teal-100 text-sm">Consumos registrados por cada cajero</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Filtros */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <button
              onClick={cargarReporte}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              🔍 Buscar
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cajeros</p>
                <p className="text-xl font-bold text-gray-900">{totales.cajeros}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🛒</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Consumos</p>
                <p className="text-xl font-bold text-gray-900">{totales.consumos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monto Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totales.monto)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de cajeros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : cajeros.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron cajeros con consumos en este período
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cajeros.map((cajero) => (
                <div key={cajero.cajeroId}>
                  {/* Fila del cajero */}
                  <div
                    onClick={() => cargarDetalleCajero(cajero.cajeroId)}
                    className={`px-6 py-4 cursor-pointer transition-colors ${
                      cajeroSeleccionado === cajero.cajeroId ? "bg-teal-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-semibold">
                          {(cajero.cajeroNombre ?? "?").charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cajero.cajeroNombre}</p>
                          <p className="text-sm text-gray-500">
                            Último: {formatDate(cajero.ultimoConsumo)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Consumos</p>
                          <p className="font-semibold text-gray-900">{cajero.totalConsumos}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(cajero.montoTotal)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Promedio</p>
                          <p className="font-semibold text-teal-600">{formatCurrency(cajero.promedioConsumo)}</p>
                        </div>
                        <span className={`transition-transform ${cajeroSeleccionado === cajero.cajeroId ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalle de consumos */}
                  {cajeroSeleccionado === cajero.cajeroId && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                      {loadingDetalle ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                        </div>
                      ) : consumosDetalle.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No hay consumos en este período</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="pb-2">Fecha</th>
                              <th className="pb-2">Cliente</th>
                              <th className="pb-2">Empresa</th>
                              <th className="pb-2">Concepto</th>
                              <th className="pb-2 text-right">Monto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {consumosDetalle.map((c) => (
                              <tr key={c.id} className={c.reversado ? "opacity-50" : ""}>
                                <td className="py-2 text-gray-600">{formatDateTime(c.fecha)}</td>
                                <td className="py-2">
                                  <p className="font-medium text-gray-900">{c.clienteNombre}</p>
                                  <p className="text-xs text-gray-500">{c.clienteCodigo}</p>
                                </td>
                                <td className="py-2 text-gray-600">{c.empresaNombre}</td>
                                <td className="py-2 text-gray-600">{c.concepto || "-"}</td>
                                <td className={`py-2 text-right font-medium ${c.reversado ? "line-through text-gray-400" : "text-gray-900"}`}>
                                  {formatCurrency(c.monto)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}