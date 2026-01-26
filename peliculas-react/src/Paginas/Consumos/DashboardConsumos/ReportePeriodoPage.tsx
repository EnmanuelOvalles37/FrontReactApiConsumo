
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";

interface DatosDia {
  fecha: string;
  cantidad: number;
  monto: number;
  reversos: number;
}

interface ReportePeriodo {
  periodo: { desde: string; hasta: string };
  resumen: {
    totalConsumos: number;
    totalMonto: number;
    totalReversos: number;
    promedioDiario: number;
  };
  porDia: DatosDia[];
}

export default function ReportePeriodoPage() {
  const [data, setData] = useState<ReportePeriodo | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filtros - últimos 30 días por defecto
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);

  const loadData = async () => {
    if (!desde || !hasta) return;
    
    setLoading(true);
    try {
      const { data: result } = await api.get(`/modulo-consumos/reportes/periodo?desde=${desde}&hasta=${hasta}`);
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <Link to="/modulo-consumos/reportes" className="hover:text-gray-700">Reportes</Link>
          <span>→</span>
          <span className="text-gray-900">Por Período</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Reporte por Período</h1>
        <p className="text-sm text-gray-500 mt-1">Análisis de consumos en un rango de fechas</p>
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
            {loading ? "Cargando..." : "Generar Reporte"}
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Consumos</p>
              <p className="text-2xl font-bold">{data.resumen.totalConsumos}</p>
            </div>
            <div className="bg-green-50 rounded-xl shadow p-4 text-center">
              <p className="text-sm text-green-600">Monto Total</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(data.resumen.totalMonto)}</p>
            </div>
            <div className="bg-red-50 rounded-xl shadow p-4 text-center">
              <p className="text-sm text-red-600">Total Reversos</p>
              <p className="text-2xl font-bold text-red-700">{data.resumen.totalReversos}</p>
            </div>
            <div className="bg-sky-50 rounded-xl shadow p-4 text-center">
              <p className="text-sm text-sky-600">Promedio Diario</p>
              <p className="text-2xl font-bold text-sky-700">{formatCurrency(data.resumen.promedioDiario)}</p>
            </div>
          </div>

          {/* Gráfico de barras */}
          <div className="bg-white rounded-2xl shadow p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Tendencia Diaria</h2>
            {data.porDia.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {data.porDia.map((dia) => {
                  const maxMonto = Math.max(...data.porDia.map(d => d.monto), 1);
                  const pct = (dia.monto / maxMonto) * 100;
                  return (
                    <div key={dia.fecha} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-500">{formatDate(dia.fecha)}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {dia.cantidad} consumos - {formatCurrency(dia.monto)}
                          {dia.reversos > 0 && (
                            <span className="text-red-600 ml-2">({dia.reversos} rev)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Sin datos para el período seleccionado</p>
            )}
          </div>

          {/* Tabla detallada */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-900">Detalle por Día</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Consumos</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Reversos</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.porDia.map((dia) => (
                    <tr key={dia.fecha} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{formatDate(dia.fecha)}</td>
                      <td className="px-4 py-3 text-right">{dia.cantidad}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">
                        {formatCurrency(dia.monto)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {dia.reversos > 0 ? (
                          <span className="text-red-600">{dia.reversos}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/modulo-consumos/reportes/diario?fecha=${dia.fecha.split("T")[0]}`}
                          className="text-sky-600 hover:underline text-sm"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3 text-right">{data.resumen.totalConsumos}</td>
                    <td className="px-4 py-3 text-right text-green-700">{formatCurrency(data.resumen.totalMonto)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{data.resumen.totalReversos}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          Selecciona un rango de fechas y haz clic en "Generar Reporte"
        </div>
      )}
    </div>
  );
}