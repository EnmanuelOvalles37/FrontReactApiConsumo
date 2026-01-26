 /* eslint-disable @typescript-eslint/no-explicit-any */
// src/Componentes/Dashboard/DashboardEmpleador.tsx
// ACTUALIZADO: Ya no envia usuarioId - el backend lo obtiene del token JWT
import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

interface DashboardStats {
  empresaId: number;
  empresaNombre: string;
  limiteCredito: number;
  diaCorte: number;
  totalEmpleados: number;
  empleadosActivos: number;
  creditoAsignado: number;
  creditoDisponible: number;
  creditoUtilizado: number;
  porcentajeUtilizado: number;
  consumosMes: number;
  consumosHoy: number;
  montoPendiente: number;
  documentosPendientes: number;
}

interface Empleado {
  id: number;
  codigo: string;
  nombre: string;
  cedula: string;
  grupo: string;
  limiteCredito: number;
  saldoDisponible: number;
  consumido: number;
  porcentajeUtilizado: number;
  activo: boolean;
  consumosMes: number;
  montoMes: number;
}

interface EmpleadoSaldoBajo {
  id: number;
  codigo: string;
  nombre: string;
  grupo: string;
  limiteCredito: number;
  saldoDisponible: number;
  porcentajeDisponible: number;
}

interface DocumentoCxc {
  id: number;
  numeroDocumento: string;
  fechaEmision: string;
  fechaVencimiento: string;
  periodoDesde: string;
  periodoHasta: string;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  cantidadConsumos: number;
  cantidadEmpleados: number;
  diasVencido: number;
}

interface Consumo {
  id: number;
  fecha: string;
  empleadoNombre: string;
  empleadoCodigo: string;
  proveedorNombre: string;
  tiendaNombre: string;
  monto: number;
  reversado: boolean;
}

export default function DashboardEmpleador() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadosSaldoBajo, setEmpleadosSaldoBajo] = useState<EmpleadoSaldoBajo[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoCxc[]>([]);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inicio" | "empleados" | "documentos" | "reportes">("inicio");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Ya no enviamos usuarioId - el backend lo obtiene del token JWT
      const [statsRes, empleadosRes, saldoBajoRes, docsRes, consumosRes] = await Promise.all([
        api.get("/empleador/dashboard"),
        api.get("/empleador/empleados"),
        api.get("/empleador/empleados-saldo-bajo"),
        api.get("/empleador/documentos-cxc"),
        api.get("/empleador/ultimos-consumos?limit=10")
      ]);
      setStats(statsRes.data);
      setEmpleados(empleadosRes.data);
      setEmpleadosSaldoBajo(saldoBajoRes.data);
      setDocumentos(docsRes.data);
      setConsumos(consumosRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => 
    `RD$${(value ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString("es-DO");

  const formatTime = (date: string) => 
    new Date(date).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });

  const getEstadoDocumento = (estado: number) => {
    const estados: Record<number, { label: string; color: string }> = {
      0: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
      1: { label: "Parcial", color: "bg-blue-100 text-blue-700" },
      2: { label: "Pagado", color: "bg-green-100 text-green-700" }
    };
    return estados[estado] || { label: "Desconocido", color: "bg-gray-100 text-gray-700" };
  };

  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 80) return "bg-red-500";
    if (porcentaje >= 60) return "bg-amber-500";
    return "bg-green-500";
  };

  const empleadosFiltrados = empleados.filter(e => 
    (e.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.codigo ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.grupo ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleLogout = () => {
    if (confirm("¿Cerrar sesión?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-sky-600 to-sky-700 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{stats?.empresaNombre || "Portal Empresa"}</h1>
                <p className="text-sky-100 text-sm">Día de corte: {stats?.diaCorte || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{currentUser?.usuario}</p>
                <p className="text-xs text-sky-200">Empleador</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                🚪
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {[
              { key: "inicio", label: "Inicio", icon: "🏠" },
              { key: "empleados", label: "Empleados", icon: "👥" },
              { key: "documentos", label: "Documentos", icon: "📄" },
              { key: "reportes", label: "Reportes", icon: "📊" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${
                  activeTab === tab.key
                    ? "bg-gray-50 text-sky-700"
                    : "text-sky-100 hover:bg-white/10"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* TAB: INICIO */}
        {activeTab === "inicio" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.empleadosActivos || 0}</p>
                    <p className="text-sm text-gray-500">Empleados Activos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.creditoDisponible)}</p>
                    <p className="text-sm text-gray-500">Disponible</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🛒</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.consumosMes)}</p>
                    <p className="text-sm text-gray-500">Consumos Mes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.montoPendiente)}</p>
                    <p className="text-sm text-gray-500">Por Pagar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de crédito */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Crédito Empresarial</h3>
                  <p className="text-sm text-gray-500">Límite: {formatCurrency(stats?.creditoAsignado)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-sky-600">{stats?.porcentajeUtilizado || 0}%</p>
                  <p className="text-sm text-gray-500">Utilizado</p>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getColorPorcentaje(stats?.porcentajeUtilizado || 0)} transition-all`}
                  style={{ width: `${stats?.porcentajeUtilizado || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500">Utilizado: {formatCurrency(stats?.creditoUtilizado)}</span>
                <span className="text-green-600">Disponible: {formatCurrency(stats?.creditoDisponible)}</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Empleados con saldo bajo */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span>⚠️</span> Empleados Saldo Bajo
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    empleadosSaldoBajo.length > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}>
                    {empleadosSaldoBajo.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {empleadosSaldoBajo.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <span className="text-2xl block mb-2">✅</span>
                      Todos tienen saldo suficiente
                    </div>
                  ) : (
                    empleadosSaldoBajo.map((e) => (
                      <div key={e.id} className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{e.nombre}</p>
                            <p className="text-xs text-gray-500">{e.codigo} - {e.grupo}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">{formatCurrency(e.saldoDisponible)}</p>
                            <p className="text-xs text-gray-400">{e.porcentajeDisponible}% disp.</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Últimos consumos */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Últimos Consumos</h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {consumos.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No hay consumos recientes</div>
                  ) : (
                    consumos.map((c) => (
                      <div key={c.id} className={`px-6 py-3 ${c.reversado ? "opacity-50" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{c.empleadoNombre}</p>
                            <p className="text-xs text-gray-500">
                              {c.proveedorNombre} - {formatTime(c.fecha)}
                            </p>
                          </div>
                          <p className={`font-semibold ${c.reversado ? "line-through text-gray-400" : "text-gray-900"}`}>
                            {formatCurrency(c.monto)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EMPLEADOS */}
        {activeTab === "empleados" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Mis Empleados ({empleados.length})</h2>
              <input
                type="text"
                placeholder="Buscar por nombre, código o grupo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg w-72"
              />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                     
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Grupo</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Límite</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Disponible</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Uso</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Consumos Mes</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {empleadosFiltrados.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        
                        <td className="px-4 py-3 font-medium text-gray-900">{e.nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{e.grupo || "-"}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(e.limiteCredito)}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(e.saldoDisponible)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getColorPorcentaje(e.porcentajeUtilizado)}`}
                                style={{ width: `${e.porcentajeUtilizado}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-10">{e.porcentajeUtilizado}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-600">{e.consumosMes}</span>
                          <span className="text-gray-400 ml-1">({formatCurrency(e.montoMes)})</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${e.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {e.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {empleadosFiltrados.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron empleados con ese criterio de búsqueda
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: DOCUMENTOS */}
        {activeTab === "documentos" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Documentos CxC</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Documento</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Período</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Vencimiento</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Consumos</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Pagado</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Pendiente</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentos.map((d) => {
                      const estado = getEstadoDocumento(d.estado);
                      return (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-sm text-gray-900">{d.numeroDocumento}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {formatDate(d.periodoDesde)} - {formatDate(d.periodoHasta)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={d.diasVencido > 0 ? "text-red-600" : "text-gray-600"}>
                              {formatDate(d.fechaVencimiento)}
                            </span>
                            {d.diasVencido > 0 && (
                              <span className="ml-2 text-xs text-red-500">+{d.diasVencido}d</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {d.cantidadConsumos}
                            <span className="text-gray-400 text-xs ml-1">({d.cantidadEmpleados} emp)</span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(d.montoTotal)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{formatCurrency(d.montoPagado)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(d.montoPendiente)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${estado.color}`}>
                              {estado.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => navigate(`/empleador/documentos/${d.id}`)}
                              className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {documentos.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No hay documentos registrados
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: REPORTES */}
        {activeTab === "reportes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Reportes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/empleador/reporte-empleados")}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="font-semibold text-gray-900">Consumos por Empleado</h3>
                <p className="text-sm text-gray-500 mt-1">Detalle de consumos por cada empleado</p>
              </button>
              <button
                onClick={() => navigate("/empleador/reporte-periodo")}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="font-semibold text-gray-900">Consumos por Período</h3>
                <p className="text-sm text-gray-500 mt-1">Resumen diario de consumos</p>
              </button>
              <button
                onClick={() => navigate("/empleador/historial-pagos")}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="font-semibold text-gray-900">Historial de Pagos</h3>
                <p className="text-sm text-gray-500 mt-1">Pagos realizados a la empresa</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}