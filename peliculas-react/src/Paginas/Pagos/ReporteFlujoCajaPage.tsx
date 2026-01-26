// src/Paginas/Pagos/ReporteFlujoCajaPage.tsx
// Reporte de flujo de caja proyectado

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";

interface FlujoDiario {
  fecha: string;
  ingresos: number;
  egresos: number;
  neto: number;
  saldoAcumulado: number;
}

interface Resumen {
  totalIngresosEsperados: number;
  totalEgresosEsperados: number;
  flujoNetoEsperado: number;
}

export default function ReporteFlujoCajaPage() {
  const [flujoDiario, setFlujoDiario] = useState<FlujoDiario[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [, setPeriodo] = useState({ desde: "", hasta: "", dias: 30 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtro
  const [dias, setDias] = useState(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await api.get(`/reportes/pagos/flujo-caja?dias=${dias}`);
      setFlujoDiario(result.flujoDiario || []);
      setResumen(result.resumen);
      setPeriodo(result.periodo);
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
    return new Date(dateStr).toLocaleDateString("es-DO", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  };

  // Calcular máximo para las barras
  const maxMonto = Math.max(
    ...flujoDiario.map(f => Math.max(f.ingresos, f.egresos)),
    1
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/pagos" className="hover:text-gray-700">Pagos</Link>
          <span>→</span>
          <Link to="/pagos/reportes" className="hover:text-gray-700">Reportes</Link>
          <span>→</span>
          <span className="text-gray-900">Flujo de Caja</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Flujo de Caja Proyectado</h1>
        <p className="text-sm text-gray-500 mt-1">Proyección de ingresos y egresos para los próximos días</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value={7}>Próximos 7 días</option>
              <option value={15}>Próximos 15 días</option>
              <option value={30}>Próximos 30 días</option>
              <option value={60}>Próximos 60 días</option>
              <option value={90}>Próximos 90 días</option>
            </select>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-2xl shadow p-4">
            <p className="text-sm text-green-600">Ingresos Esperados (CxC)</p>
            <p className="text-3xl font-bold text-green-700">{formatCurrency(resumen.totalIngresosEsperados)}</p>
            <p className="text-xs text-green-600 mt-1">Cobros por vencer en {dias} días</p>
          </div>
          <div className="bg-red-50 rounded-2xl shadow p-4">
            <p className="text-sm text-red-600">Egresos Esperados (CxP)</p>
            <p className="text-3xl font-bold text-red-700">{formatCurrency(resumen.totalEgresosEsperados)}</p>
            <p className="text-xs text-red-600 mt-1">Pagos por vencer en {dias} días</p>
          </div>
          <div className={`rounded-2xl shadow p-4 ${resumen.flujoNetoEsperado >= 0 ? 'bg-sky-50' : 'bg-amber-50'}`}>
            <p className={`text-sm ${resumen.flujoNetoEsperado >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>
              Flujo Neto Esperado
            </p>
            <p className={`text-3xl font-bold ${resumen.flujoNetoEsperado >= 0 ? 'text-sky-700' : 'text-amber-700'}`}>
              {formatCurrency(resumen.flujoNetoEsperado)}
            </p>
            <p className={`text-xs mt-1 ${resumen.flujoNetoEsperado >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>
              {resumen.flujoNetoEsperado >= 0 ? '✓ Flujo positivo' : '⚠️ Flujo negativo'}
            </p>
          </div>
        </div>
      )}

      {/* Gráfico simple de barras */}
      {flujoDiario.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Proyección Diaria</h2>
          <div className="space-y-3">
            {flujoDiario.map((dia) => (
              <div key={dia.fecha} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600 flex-shrink-0">
                  {formatDate(dia.fecha)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {/* Barra de ingresos */}
                  <div className="flex-1 flex items-center">
                    <div
                      className="h-6 bg-green-500 rounded-l"
                      style={{ width: `${(dia.ingresos / maxMonto) * 100}%`, minWidth: dia.ingresos > 0 ? '4px' : '0' }}
                    />
                    {dia.ingresos > 0 && (
                      <span className="text-xs text-green-700 ml-1">{formatCurrency(dia.ingresos)}</span>
                    )}
                  </div>
                  {/* Barra de egresos */}
                  <div className="flex-1 flex items-center justify-end">
                    {dia.egresos > 0 && (
                      <span className="text-xs text-red-700 mr-1">{formatCurrency(dia.egresos)}</span>
                    )}
                    <div
                      className="h-6 bg-red-500 rounded-r"
                      style={{ width: `${(dia.egresos / maxMonto) * 100}%`, minWidth: dia.egresos > 0 ? '4px' : '0' }}
                    />
                  </div>
                </div>
                <div className={`w-32 text-right text-sm font-medium ${dia.saldoAcumulado >= 0 ? 'text-sky-700' : 'text-amber-700'}`}>
                  {formatCurrency(dia.saldoAcumulado)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Ingresos (CxC)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Egresos (CxP)</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">Saldo Acumulado →</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla detallada */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Detalle por Día</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-right font-medium text-green-600">Ingresos</th>
                <th className="px-4 py-3 text-right font-medium text-red-600">Egresos</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Neto del Día</th>
                <th className="px-4 py-3 text-right font-medium text-sky-600">Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flujoDiario.map((dia) => (
                <tr key={dia.fecha} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(dia.fecha)}</td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {dia.ingresos > 0 ? formatCurrency(dia.ingresos) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-red-700">
                    {dia.egresos > 0 ? formatCurrency(dia.egresos) : "-"}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${dia.neto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(dia.neto)}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${dia.saldoAcumulado >= 0 ? 'text-sky-700' : 'text-amber-700'}`}>
                    {formatCurrency(dia.saldoAcumulado)}
                  </td>
                </tr>
              ))}
              {flujoDiario.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No hay movimientos proyectados para el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
        <p className="font-medium">ℹ️ Información</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Ingresos:</strong> Documentos CxC pendientes que vencen en el período</li>
          <li><strong>Egresos:</strong> Documentos CxP pendientes que vencen en el período</li>
          <li><strong>Saldo Acumulado:</strong> Suma acumulada del flujo neto diario</li>
          <li>Este reporte es una proyección basada en fechas de vencimiento, no en cobros/pagos reales</li>
        </ul>
      </div>
    </div>
  );
}