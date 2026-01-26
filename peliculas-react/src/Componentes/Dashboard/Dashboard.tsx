// src/Componentes/Dashboard/Dashboard.tsx
// Dashboard principal 
import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";
import StatsCards from "./StatsCards";
import QuickActions from "./QuickActions";
import ModuleGrid from "../../Paginas/Dashboard/ModuleGrid";
//import ModuleGrid from "./ModuleGrid";

type DashboardStats = {
  totalClientes: number;
  clientesActivos: number;
  consumosHoy: number;
  consumosAyer: number;
  cambioConsumos: number;
  montoConsumosHoy: number;
  saldoTotalDisponible: number;
  saldoTotalAsignado: number;
  porcentajeSaldoUtilizado: number;
  totalProveedores: number;
  proveedoresActivos: number;
  totalEmpresas: number;
  empresasActivas: number;
};

type ExtendedStats = {
  consumosPorDia: Array<{ fecha: string; cantidad: number; monto: number }>;
  topEmpresas: Array<{ id: number; nombre: string; cantidadConsumos: number; montoTotal: number }>;
  topProveedores: Array<{ id: number; nombre: string; cantidadConsumos: number; montoTotal: number }>;
  clientesSaldoBajo: Array<{ id: number; nombre: string; empresaNombre: string; saldo: number; saldoOriginal: number; porcentajeDisponible: number }>;
  ultimosConsumos: Array<{ id: number; fecha: string; clienteNombre: string; empresaNombre: string; proveedorNombre: string; monto: number; reversado: boolean }>;
};

const Dashboard = () => {
  const { currentUser, hasPermission, logout, esCajero } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [extendedStats, setExtendedStats] = useState<ExtendedStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingExtended, setLoadingExtended] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // REDIRECCIÓN PARA CAJEROS (CORREGIDA)
  // ==========================================
  const esCajeroCheck =
    esCajero ||
    (hasPermission("registrar_consumo") &&
      !hasPermission("admin") &&
      !hasPermission("reporte_consumos"));

      // Redireccion para backoffice (rol id = 5)
const esBackoffice = currentUser?.rolId === 5;

// Redireccion para empleador (rol id = 4)
const esEmpleador = currentUser?.rolId === 4;

  useEffect(() => {
    if (esCajeroCheck) {
      navigate("/dashboard-cajero", { replace: true });
    } else if (esBackoffice) {
    navigate("/dashboard-backoffice", { replace: true });
  } else if (esEmpleador) {
    navigate("/dashboard-empleador", { replace: true });
  }
}, [esCajeroCheck, esBackoffice, esEmpleador, navigate]);

  // ==========================================
  // Cargar estadísticas principales
  // ==========================================
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        const { data } = await api.get("/dashboard-stats");
        setStats(data);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setError("No se pudieron cargar las estadísticas");
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // ==========================================
  // Cargar estadísticas extendidas
  // ==========================================
  useEffect(() => {
    const loadExtendedStats = async () => {
      try {
        setLoadingExtended(true);
        const { data } = await api.get("/dashboard-stats/extended");
        setExtendedStats(data);
      } catch (err) {
        console.error("Error cargando estadísticas extendidas:", err);
      } finally {
        setLoadingExtended(false);
      }
    };

    loadExtendedStats();
  }, []);

  // ==========================================
  // Logout
  // ==========================================
  const handleLogout = () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  // Refrescar datos
  const handleRefresh = async () => {
    setLoadingStats(true);
    setLoadingExtended(true);
    try {
      const [statsRes, extendedRes] = await Promise.all([
        api.get("/dashboard-stats"),
        api.get("/dashboard-stats/extended")
      ]);
      
      setStats({
        totalClientes: statsRes.data.totalClientes,
        clientesActivos: statsRes.data.clientesActivos,
        consumosHoy: statsRes.data.consumosHoy,
        consumosAyer: statsRes.data.consumosAyer,
        cambioConsumos: statsRes.data.cambioConsumos,
        montoConsumosHoy: statsRes.data.montoConsumosHoy,
        saldoTotalDisponible: statsRes.data.saldoTotalDisponible,
        saldoTotalAsignado: statsRes.data.saldoTotalAsignado,
        porcentajeSaldoUtilizado: statsRes.data.porcentajeSaldoUtilizado,
        totalProveedores: statsRes.data.totalProveedores,
        proveedoresActivos: statsRes.data.proveedoresActivos,
        totalEmpresas: statsRes.data.totalEmpresas,
        empresasActivas: statsRes.data.empresasActivas,
      });
      
      setExtendedStats({
        consumosPorDia: extendedRes.data.consumosPorDia,
        topEmpresas: extendedRes.data.topEmpresas,
        topProveedores: extendedRes.data.topProveedores,
        clientesSaldoBajo: extendedRes.data.clientesSaldoBajo,
        ultimosConsumos: extendedRes.data.ultimosConsumos,
      });
    } catch (err) {
      console.error("Error refrescando:", err);
    } finally {
      setLoadingStats(false);
      setLoadingExtended(false);
    }
  };

  // Obtener saludo según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // Obtener fecha formateada
  const getFormattedDate = () => {
    return new Date().toLocaleDateString("es-DO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💼</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Sistema de Gestión</h1>
                <p className="text-xs text-gray-500 capitalize">{getFormattedDate()}</p>
              </div>
            </div>

            {/* Usuario y logout */}
            <div className="flex items-center gap-4">
              {/* Botón refrescar */}
              <button
                onClick={handleRefresh}
                disabled={loadingStats}
                className="p-2.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                title="Actualizar datos"
              >
                <span className={`text-lg ${loadingStats ? "animate-spin" : ""}`}>🔄</span>
              </button>

              {/* Info del usuario */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center text-white font-semibold">
                  {currentUser?.usuario?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.usuario}</p>
                  <p className="text-xs text-gray-500">{currentUser?.rol}</p>
                </div>
              </div>

              {/* Botón logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Cerrar sesión"
              >
                <span className="text-lg">🚪</span>
                <span className="hidden sm:inline text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-100 text-sm mb-1">{getGreeting()}</p>
                <h2 className="text-2xl font-bold mb-2">
                  {currentUser?.usuario} 👋
                </h2>
                <p className="text-sky-100">
                  Bienvenido al panel de control. Aquí tienes un resumen de tu actividad.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-5xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Estadísticas */}
        <StatsCards stats={stats} loading={loadingStats} />

        {/* Acciones rápidas */}
        <QuickActions hasPermission={hasPermission} />

        {/* Grid de módulos */}
        <ModuleGrid />

        {/* Sección de información adicional */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimos Consumos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span>📋</span> Últimos Consumos
              </h3>
              <button 
                onClick={() => navigate("/modulo-consumos")}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Ver todos →
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {loadingExtended ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                </div>
              ) : extendedStats?.ultimosConsumos && extendedStats.ultimosConsumos.length > 0 ? (
                extendedStats.ultimosConsumos.map((consumo) => (
                  <div key={consumo.id} className={`px-6 py-3 hover:bg-gray-50 ${consumo.reversado ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{consumo.clienteNombre}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {consumo.empresaNombre} • {consumo.proveedorNombre}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-semibold ${consumo.reversado ? "text-gray-400 line-through" : "text-gray-900"}`}>
                          {formatCurrency(consumo.monto)}
                        </p>
                        <p className="text-xs text-gray-400">{formatTime(consumo.fecha)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-500 text-sm">No hay consumos recientes</p>
                </div>
              )}
            </div>
          </div>

          {/* Clientes con Saldo Bajo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span>⚠️</span> Clientes con Saldo Bajo
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                extendedStats?.clientesSaldoBajo && extendedStats.clientesSaldoBajo.length > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {extendedStats?.clientesSaldoBajo?.length || 0} alertas
              </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {loadingExtended ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                </div>
              ) : extendedStats?.clientesSaldoBajo && extendedStats.clientesSaldoBajo.length > 0 ? (
                extendedStats.clientesSaldoBajo.map((cliente) => (
                  <div key={cliente.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{cliente.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{cliente.empresaNombre}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-red-600">{formatCurrency(cliente.saldo)}</p>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${cliente.porcentajeDisponible}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{cliente.porcentajeDisponible}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-gray-500 text-sm">Todos los clientes tienen saldo suficiente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer del dashboard */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Sistema de Gestión • Versión 1.0
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;