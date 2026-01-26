 // src/Paginas/Empleador/ReporteEmpleadosPage.tsx
// Reporte de consumos por empleado - Vista Empleador

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

interface EmpleadoConsumo {
  empleadoId: number;
  codigo: string;
  empleadoNombre: string;
  grupo: string;
  limiteCredito: number;
  saldoDisponible: number;
  totalConsumos: number;
  montoTotal: number;
  ultimoConsumo: string | null;
}

interface ConsumoDetalle {
  id: number;
  fecha: string;
  proveedorNombre: string;
  tiendaNombre: string;
  concepto: string;
  monto: number;
  reversado: boolean;
}

export default function ReporteEmpleadosPage() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState<EmpleadoConsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  // Filtros de fecha
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setDate(1); // Primer día del mes
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Detalle de empleado seleccionado
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null);
  const [consumosDetalle, setConsumosDetalle] = useState<ConsumoDetalle[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    cargarReporte();
  }, [desde, hasta]);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      // URL corregida para coincidir con el backend
      const res = await api.get("/empleador/reporte/por-empleado", {
        params: { desde, hasta }
      });
      // El backend devuelve { data, resumen, fechaDesde, fechaHasta }
      setEmpleados(res.data.data || []);
    } catch (error) {
      console.error("Error cargando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleEmpleado = async (empleadoId: number) => {
    if (empleadoSeleccionado === empleadoId) {
      setEmpleadoSeleccionado(null);
      setConsumosDetalle([]);
      return;
    }

    try {
      setLoadingDetalle(true);
      setEmpleadoSeleccionado(empleadoId);
      const res = await api.get(`/empleador/empleados/${empleadoId}/consumos`, {
        params: { desde, hasta }
      });
      setConsumosDetalle(res.data || []);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) =>
    `RD$${(value ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });

  const empleadosFiltrados = empleados.filter(e =>
    (e.empleadoNombre ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.codigo ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.grupo ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const totales = {
    empleados: empleados.length,
    consumos: empleados.reduce((sum, e) => sum + (e.totalConsumos ?? 0), 0),
    monto: empleados.reduce((sum, e) => sum + (e.montoTotal ?? 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-sky-600 to-sky-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard-empleador")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-xl font-bold">Consumos por Empleado</h1>
              <p className="text-sky-100 text-sm">Detalle de consumos de tus empleados</p>
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
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por nombre, código o grupo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Empleados</p>
                <p className="text-xl font-bold text-gray-900">{totales.empleados}</p>
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

        {/* Lista de empleados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : empleadosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron empleados con consumos en este período
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {empleadosFiltrados.map((emp) => (
                <div key={emp.empleadoId}>
                  {/* Fila del empleado */}
                  <div
                    onClick={() => cargarDetalleEmpleado(emp.empleadoId)}
                    className={`px-6 py-4 cursor-pointer transition-colors ${
                      empleadoSeleccionado === emp.empleadoId ? "bg-sky-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-semibold">
                          {(emp.empleadoNombre ?? "?").charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.empleadoNombre}</p>
                          <p className="text-sm text-gray-500">{emp.codigo} • {emp.grupo || "Sin grupo"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Consumos</p>
                          <p className="font-semibold text-gray-900">{emp.totalConsumos}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(emp.montoTotal)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Disponible</p>
                          <p className={`font-semibold ${emp.saldoDisponible < emp.limiteCredito * 0.2 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(emp.saldoDisponible)}
                          </p>
                        </div>
                        <span className={`transition-transform ${empleadoSeleccionado === emp.empleadoId ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalle de consumos */}
                  {empleadoSeleccionado === emp.empleadoId && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                      {loadingDetalle ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mx-auto"></div>
                        </div>
                      ) : consumosDetalle.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No hay consumos en este período</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="pb-2">Fecha</th>
                              <th className="pb-2">Proveedor</th>
                              <th className="pb-2">Concepto</th>
                              <th className="pb-2 text-right">Monto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {consumosDetalle.map((c) => (
                              <tr key={c.id} className={c.reversado ? "opacity-50" : ""}>
                                <td className="py-2 text-gray-600">{formatDateTime(c.fecha)}</td>
                                <td className="py-2 text-gray-900">
                                  {c.proveedorNombre}
                                  {c.tiendaNombre && <span className="text-gray-400 text-xs ml-1">({c.tiendaNombre})</span>}
                                </td>
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