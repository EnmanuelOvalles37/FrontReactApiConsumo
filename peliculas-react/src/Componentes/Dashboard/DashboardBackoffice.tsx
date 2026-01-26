/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Componentes/Dashboard/DashboardBackoffice.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

interface DashboardStats {
  proveedorId: number;
  totalTiendas: number;
  totalCajas: number;
  totalCajeros: number;
  consumosMes: number;
  consumosHoy: number;
  montoPendienteCobro: number;
  documentosPendientes: number;
}

interface Proveedor {
  id: number;
  nombre: string;
  rnc: string;
  telefono: string;
  email: string;
  diasCorte: number;
  porcentajeComision: number;
}

interface Tienda {
  id: number;
  nombre: string;
  activo: boolean;
  totalCajas: number;
  totalCajeros: number;
  consumosMes: number;
}

interface Cajero {
  id: number;
  nombre: string;
  activo: boolean;
  tiendaNombre: string;
  cajaNombre: string;
  consumosHoy: number;
  montoHoy: number;
  ultimoLoginUtc: string;
}

interface DocumentoCxp {
  id: number;
  numeroDocumento: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoBruto: number;
  montoComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  diasVencido: number;
}

interface Consumo {
  id: number;
  fecha: string;
  clienteNombre: string;
  clienteCodigo: string;
  empresaNombre: string;
  tiendaNombre: string;
  cajeroNombre: string;
  monto: number;
  reversado: boolean;
}

export default function DashboardBackoffice() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [cajeros, setCajeros] = useState<Cajero[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoCxp[]>([]);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inicio" | "tiendas" | "cajeros" | "documentos" | "reportes">("inicio");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Ya no enviamos usuarioId - el backend lo obtiene del token JWT
      const [proveedorRes, statsRes, tiendasRes, cajerosRes, docsRes, consumosRes] = await Promise.all([
        api.get("/backoffice/mi-proveedor"),
        api.get("/backoffice/dashboard"),
        api.get("/backoffice/tiendas"),
        api.get("/backoffice/cajeros"),
        api.get("/backoffice/documentos-cxp"),
        api.get("/backoffice/ultimos-consumos?limit=10")
      ]);
      setProveedor(proveedorRes.data);
      setStats(statsRes.data);
      setTiendas(tiendasRes.data);
      setCajeros(cajerosRes.data);
      setDocumentos(docsRes.data);
      setConsumos(consumosRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    `RD$${value?.toLocaleString("es-DO", { minimumFractionDigits: 2 }) || "0.00"}`;

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

  const handleLogout = () => {
    if (confirm("Cerrar sesion?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{proveedor?.nombre || "Portal Proveedor"}</h1>
                <p className="text-teal-100 text-sm">RNC: {proveedor?.rnc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{currentUser?.usuario}</p>
                <p className="text-xs text-teal-200">Backoffice</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Cerrar sesion"
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
              { key: "tiendas", label: "Tiendas", icon: "🏬" },
              { key: "cajeros", label: "Cajeros", icon: "👥" },
              { key: "documentos", label: "Documentos", icon: "📄" },
              { key: "reportes", label: "Reportes", icon: "📊" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${
                  activeTab === tab.key
                    ? "bg-gray-50 text-teal-700"
                    : "text-teal-100 hover:bg-white/10"
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
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏬</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTiendas || 0}</p>
                    <p className="text-sm text-gray-500">Tiendas</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalCajeros || 0}</p>
                    <p className="text-sm text-gray-500">Cajeros</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💵</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.consumosHoy || 0)}</p>
                    <p className="text-sm text-gray-500">Ventas Hoy</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.montoPendienteCobro || 0)}</p>
                    <p className="text-sm text-gray-500">Por Cobrar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen del mes */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Consumos del Mes</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats?.consumosMes || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-teal-100 text-sm">Documentos Pendientes</p>
                  <p className="text-3xl font-bold mt-1">{stats?.documentosPendientes || 0}</p>
                </div>
              </div>
            </div>

            {/* Ultimos consumos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Ultimos Consumos</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {consumos.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No hay consumos recientes</div>
                ) : (
                  consumos.map((c) => (
                    <div key={c.id} className={`px-6 py-3 ${c.reversado ? "opacity-50" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{c.clienteNombre}</p>
                          <p className="text-xs text-gray-500">
                            {c.empresaNombre} - {c.tiendaNombre} - {formatTime(c.fecha)}
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
        )}

        {/* TAB: TIENDAS */}
        {activeTab === "tiendas" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Mis Tiendas ({tiendas.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiendas.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <span className="text-lg">🏬</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{t.nombre}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${t.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {t.activo ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-gray-900">{t.totalCajas}</p>
                      <p className="text-xs text-gray-500">Cajas</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-gray-900">{t.totalCajeros}</p>
                      <p className="text-xs text-gray-500">Cajeros</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-sm font-bold text-teal-600">{formatCurrency(t.consumosMes)}</p>
                      <p className="text-xs text-gray-500">Mes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {tiendas.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
                No hay tiendas registradas
              </div>
            )}
          </div>
        )}

        {/* TAB: CAJEROS */}
        {activeTab === "cajeros" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Mis Cajeros ({cajeros.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Cajero</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Tienda</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Caja</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Consumos Hoy</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Monto Hoy</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cajeros.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{c.nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{c.tiendaNombre}</td>
                        <td className="px-4 py-3 text-gray-600">{c.cajaNombre || "-"}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{c.consumosHoy}</td>
                        <td className="px-4 py-3 text-right font-medium text-teal-600">{formatCurrency(c.montoHoy)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${c.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {c.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cajeros.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No hay cajeros asignados
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: DOCUMENTOS */}
        {activeTab === "documentos" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Documentos CxP</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Documento</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Emision</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Vencimiento</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Pagado</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Pendiente</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentos.map((d) => {
                      const estado = getEstadoDocumento(d.estado);
                      return (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-sm text-gray-900">{d.numeroDocumento}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(d.fechaEmision)}</td>
                          <td className="px-4 py-3">
                            <span className={d.diasVencido > 0 ? "text-red-600" : "text-gray-600"}>
                              {formatDate(d.fechaVencimiento)}
                            </span>
                            {d.diasVencido > 0 && (
                              <span className="ml-2 text-xs text-red-500">+{d.diasVencido}d</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(d.montoTotal)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{formatCurrency(d.montoPagado)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(d.montoPendiente)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${estado.color}`}>
                              {estado.label}
                            </span>
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
                onClick={() => navigate("/backoffice/reporte-cajeros")}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="font-semibold text-gray-900">Reporte por Cajero</h3>
                <p className="text-sm text-gray-500 mt-1">Consumos registrados por cada cajero</p>
              </button>
              <button
                onClick={() => navigate("/backoffice/reporte-tiendas")}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🏬</span>
                </div>
                <h3 className="font-semibold text-gray-900">Reporte por Tienda</h3>
                <p className="text-sm text-gray-500 mt-1">Ventas agrupadas por tienda</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}