// src/Paginas/Consumos/DashboardConsumosPage.tsx
// Dashboard principal del módulo de consumos

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";


interface DashboardData {
  fechaConsulta: string;
  resumen: {
    consumosHoy: number;
    montoHoy: number;
    reversosHoy: number;
    montoReversadoHoy: number;
    montoNetoHoy: number;
  };
  consumosPorDia: Array<{ fecha: string; cantidad: number; monto: number }>;
  topEmpresas: Array<{ empresaId: number; empresaNombre: string; cantidadConsumos: number; montoTotal: number }>;
  topClientes: Array<{ clienteId: number; clienteNombre: string; clienteCedula: string; empresaNombre: string; cantidadConsumos: number; montoTotal: number }>;
  ultimosConsumos: Array<{
    id: number;
    fecha: string;
    clienteNombre: string;
    clienteCedula: string;
    empresaNombre: string;
    proveedorNombre: string;
    tiendaNombre: string;
    monto: number;
    concepto: string;
    reversado: boolean;
  }>;
}

export default function DashboardConsumosPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadData();
  }, [fecha]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result } = await api.get(`/modulo-consumos/dashboard?fecha=${fecha}`);
      setData(result);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard de Consumos</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen y estadísticas de consumos</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={loadData}
            className="p-2 rounded-xl border hover:bg-gray-50"
            title="Actualizar"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <p className="text-sm text-gray-500">Consumos</p>
              <p className="text-2xl font-bold text-gray-900">{data?.resumen.consumosHoy || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
              💰
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(data?.resumen.montoNetoHoy || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
              ↩️
            </div>
            <div>
              <p className="text-sm text-gray-500">Reversos</p>
              <p className="text-2xl font-bold text-red-700">{data?.resumen.reversosHoy || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
              💸
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto Reversado</p>
              <p className="text-2xl font-bold text-amber-700">{formatCurrency(data?.resumen.montoReversadoHoy || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        
        <Link
          to="/modulo-consumos/lista"
          className="bg-white border rounded-xl p-3 text-center hover:bg-gray-50 transition-colors"
        >
          📋 Ver Consumos
        </Link>
        <Link
          to="/modulo-consumos/reversos"
          className="bg-white border rounded-xl p-3 text-center hover:bg-gray-50 transition-colors"
        >
          ↩️ Reversos
        </Link>
        <Link
          to="/modulo-consumos/por-empresa"
          className="bg-white border rounded-xl p-3 text-center hover:bg-gray-50 transition-colors"
        >
          🏢 Por Empresa
        </Link>
        <Link
          to="/modulo-consumos/reportes"
          className="bg-white border rounded-xl p-3 text-center hover:bg-gray-50 transition-colors"
        >
          📊 Reportes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de consumos por día */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Consumos Últimos 7 Días</h2>
          {data?.consumosPorDia && data.consumosPorDia.length > 0 ? (
            <div className="space-y-2">
              {data.consumosPorDia.map((dia) => {
                const maxMonto = Math.max(...data.consumosPorDia.map(d => d.monto), 1);
                const pct = (dia.monto / maxMonto) * 100;
                return (
                  <div key={dia.fecha} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-500">
                      {new Date(dia.fecha).toLocaleDateString("es-DO", { weekday: "short", day: "numeric" })}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-sky-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {dia.cantidad} - {formatCurrency(dia.monto)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sin datos para mostrar</p>
          )}
        </div>

        {/* Top Empresas */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Top 5 Empresas</h2>
            <Link to="/modulo-consumos/por-empresa" className="text-sm text-sky-600 hover:underline">
              Ver todas →
            </Link>
          </div>
          {data?.topEmpresas && data.topEmpresas.length > 0 ? (
            <div className="space-y-3">
              {data.topEmpresas.map((empresa, idx) => (
                <div key={empresa.empresaId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        idx === 1 ? 'bg-gray-200 text-gray-600' : 
                        idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium">{empresa.empresaNombre}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">{formatCurrency(empresa.montoTotal)}</p>
                    <p className="text-xs text-gray-500">{empresa.cantidadConsumos} consumos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sin datos para mostrar</p>
          )}
        </div>
      </div>

      {/* Últimos consumos */}
      <div className="bg-white rounded-2xl shadow mt-6 overflow-hidden">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Últimos Consumos del Día</h2>
          <Link to="/modulo-consumos/lista" className="text-sm text-sky-600 hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Hora</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Cliente</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Empresa</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Proveedor</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Monto</th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.ultimosConsumos && data.ultimosConsumos.length > 0 ? (
                data.ultimosConsumos.map((consumo) => (
                  <tr key={consumo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{formatTime(consumo.fecha)}</td>
                    <td className="px-4 py-2">
                      <Link to={`/modulo-consumos/${consumo.id}`} className="text-sky-600 hover:underline">
                        {consumo.clienteNombre}
                      </Link>
                      {consumo.clienteCedula && (
                        <p className="text-xs text-gray-400">{consumo.clienteCedula}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{consumo.empresaNombre}</td>
                    <td className="px-4 py-2">
                      {consumo.proveedorNombre}
                      {consumo.tiendaNombre && (
                        <p className="text-xs text-gray-400">{consumo.tiendaNombre}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(consumo.monto)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {consumo.reversado ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                          Reversado
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          ✓ Activo
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay consumos registrados hoy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Clientes */}
      {data?.topClientes && data.topClientes.length > 0 && (
        <div className="bg-white rounded-2xl shadow mt-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Top 5 Clientes del Día</h2>
            <Link to="/modulo-consumos/por-cliente" className="text-sm text-sky-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {data.topClientes.map((cliente, idx) => (
              <div key={cliente.clienteId} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium text-sm truncate">{cliente.clienteNombre}</span>
                </div>
                <p className="text-xs text-gray-500">{cliente.empresaNombre}</p>
                <p className="font-bold text-green-700 mt-1">{formatCurrency(cliente.montoTotal)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}