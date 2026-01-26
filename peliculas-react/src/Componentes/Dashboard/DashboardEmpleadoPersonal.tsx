// src/Componentes/Dashboard/DashboardEmpleadoPersonal.tsx
// Dashboard personal para empleados (clientes)

import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

interface MiPerfil {
  id: number;
  codigo: string;
  nombre: string;
  cedula: string;
  empresaNombre: string;
  grupo: string | null;
  limiteCredito: number;
  saldoDisponible: number;
  creditoUtilizado: number;
  porcentajeUtilizado: number;
}

interface Consumo {
  id: number;
  fecha: string;
  proveedorNombre: string;
  tiendaNombre: string | null;
  concepto: string | null;
  monto: number;
  reversado: boolean;
}

interface Resumen {
  totalConsumos: number;
  montoTotal: number;
}

export default function DashboardEmpleadoPersonal() {
  const {  logout } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<MiPerfil | null>(null);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConsumos, setLoadingConsumos] = useState(false);

  // Filtro por mes
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  useEffect(() => {
    if (perfil) {
      cargarConsumos();
    }
  }, [mesSeleccionado, perfil]);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cliente/mi-perfil");
      setPerfil(res.data);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarConsumos = async () => {
    try {
      setLoadingConsumos(true);
      const [year, month] = mesSeleccionado.split("-");
      const desde = `${year}-${month}-01`;
      const ultimoDia = new Date(parseInt(year), parseInt(month), 0).getDate();
      const hasta = `${year}-${month}-${ultimoDia}`;

      const res = await api.get("/cliente/mis-consumos", {
        params: { desde, hasta }
      });
      setConsumos(res.data.consumos || []);
      setResumen(res.data.resumen || null);
    } catch (error) {
      console.error("Error cargando consumos:", error);
    } finally {
      setLoadingConsumos(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) =>
    `RD$${(value ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("es-DO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  const generarOpcionesMeses = () => {
    const meses = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const valor = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      const label = fecha.toLocaleDateString("es-DO", { month: "long", year: "numeric" });
      meses.push({ valor, label });
    }
    return meses;
  };

  const getNombreMes = (mes: string) => {
    const [year, month] = mes.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("es-DO", { month: "long", year: "numeric" });
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sin acceso</h2>
          <p className="text-gray-500 mb-4">No se encontró un perfil asociado.</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const porcentajeVisual = Math.min(perfil.porcentajeUtilizado, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{perfil.nombre}</h1>
                <p className="text-indigo-200 text-sm">{perfil.empresaNombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/cambiar-contrasena")}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Cambiar contraseña"
              >
                🔐
              </button>
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
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Tarjeta de Crédito */}
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-indigo-200 text-sm">Código</p>
              <p className="font-mono text-lg">{perfil.codigo}</p>
            </div>
            {perfil.grupo && (
              <div className="text-right">
                <p className="text-indigo-200 text-sm">Grupo</p>
                <p className="font-medium">{perfil.grupo}</p>
              </div>
            )}
          </div>

          {/* Saldo Disponible */}
          <div className="text-center mb-6">
            <p className="text-indigo-200 text-sm mb-1">Saldo Disponible</p>
            <p className="text-4xl font-bold">{formatCurrency(perfil.saldoDisponible)}</p>
          </div>

          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-indigo-200">Utilizado</span>
              <span className="text-indigo-200">{perfil.porcentajeUtilizado.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  porcentajeVisual > 80 ? "bg-red-400" : porcentajeVisual > 50 ? "bg-amber-400" : "bg-green-400"
                }`}
                style={{ width: `${porcentajeVisual}%` }}
              />
            </div>
          </div>

          {/* Detalle */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-indigo-200 text-xs">Límite de Crédito</p>
              <p className="font-semibold">{formatCurrency(perfil.limiteCredito)}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-xs">Crédito Utilizado</p>
              <p className="font-semibold">{formatCurrency(perfil.creditoUtilizado)}</p>
            </div>
          </div>
        </div>

        {/* Resumen del Mes */}
        {resumen && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🛒</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consumos del Mes</p>
                  <p className="text-xl font-bold text-gray-900">{resumen.totalConsumos}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Gastado</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(resumen.montoTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Consumos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Mis Consumos</h3>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
            >
              {generarOpcionesMeses().map((m) => (
                <option key={m.valor} value={m.valor}>{m.label}</option>
              ))}
            </select>
          </div>

          {loadingConsumos ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : consumos.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Sin consumos</h4>
              <p className="text-sm text-gray-500">
                No tienes consumos en {getNombreMes(mesSeleccionado)}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {consumos.map((consumo) => (
                <div
                  key={consumo.id}
                  className={`px-6 py-4 ${consumo.reversado ? "opacity-50 bg-gray-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        consumo.reversado ? "bg-gray-200" : "bg-indigo-100"
                      }`}>
                        <span className="text-lg">{consumo.reversado ? "↩️" : "🏪"}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {consumo.proveedorNombre}
                          {consumo.reversado && (
                            <span className="ml-2 text-xs text-red-500">(Reversado)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {consumo.tiendaNombre && `${consumo.tiendaNombre} • `}
                          {formatDateTime(consumo.fecha)}
                        </p>
                        {consumo.concepto && (
                          <p className="text-xs text-gray-400 mt-1">{consumo.concepto}</p>
                        )}
                      </div>
                    </div>
                    <p className={`font-semibold text-lg ${
                      consumo.reversado ? "line-through text-gray-400" : "text-gray-900"
                    }`}>
                      {formatCurrency(consumo.monto)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 pb-4">
          <p>Cédula: {perfil.cedula}</p>
        </div>
      </main>
    </div>
  );
}