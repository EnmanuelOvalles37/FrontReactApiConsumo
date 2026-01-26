
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";

interface ReporteDiario {
  fecha: string;
  resumen: {
    totalConsumos: number;
    totalReversos: number;
    montoTotal: number;
    montoReversado: number;
    montoNeto: number;
  };
  porHora: Array<{ hora: number; cantidad: number; monto: number }>;
  porEmpresa: Array<{ empresa: string; cantidad: number; monto: number }>;
  porProveedor: Array<{ proveedor: string; cantidad: number; monto: number }>;
}

export default function ReporteDiarioPage() {
  const [data, setData] = useState<ReporteDiario | null>(null);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadData();
  }, [fecha]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result } = await api.get(`/modulo-consumos/reportes/diario?fecha=${fecha}`);
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatHora = (hora: number) => {
    return `${hora.toString().padStart(2, "0")}:00`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando reporte...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <Link to="/modulo-consumos/reportes" className="hover:text-gray-700">Reportes</Link>
          <span>→</span>
          <span className="text-gray-900">Diario</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reporte Diario de Consumos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Resumen del día {new Date(fecha + "T12:00:00").toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Consumos</p>
          <p className="text-2xl font-bold">{data?.resumen.totalConsumos || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-green-600">Monto Total</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(data?.resumen.montoTotal || 0)}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-red-600">Reversos</p>
          <p className="text-2xl font-bold text-red-700">{data?.resumen.totalReversos || 0}</p>
        </div>
        <div className="bg-amber-50 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-amber-600">Monto Reversado</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(data?.resumen.montoReversado || 0)}</p>
        </div>
        <div className="bg-sky-50 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-sky-600">Monto Neto</p>
          <p className="text-2xl font-bold text-sky-700">{formatCurrency(data?.resumen.montoNeto || 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por hora */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Consumos por Hora</h2>
          {data?.porHora && data.porHora.length > 0 ? (
            <div className="space-y-2">
              {data.porHora.map((h) => {
                const maxMonto = Math.max(...data.porHora.map(x => x.monto), 1);
                const pct = (h.monto / maxMonto) * 100;
                return (
                  <div key={h.hora} className="flex items-center gap-3">
                    <div className="w-12 text-sm text-gray-500">{formatHora(h.hora)}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-sky-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {h.cantidad} - {formatCurrency(h.monto)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sin datos</p>
          )}
        </div>

        {/* Por empresa */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Por Empresa</h2>
          {data?.porEmpresa && data.porEmpresa.length > 0 ? (
            <div className="space-y-3">
              {data.porEmpresa.slice(0, 10).map((e, idx) => (
                <div key={e.empresa} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium">{e.empresa}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">{formatCurrency(e.monto)}</p>
                    <p className="text-xs text-gray-500">{e.cantidad} consumos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sin datos</p>
          )}
        </div>

        {/* Por proveedor */}
        <div className="bg-white rounded-2xl shadow p-4 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Por Proveedor</h2>
          {data?.porProveedor && data.porProveedor.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.porProveedor.map((p) => (
                <div key={p.proveedor} className="bg-gray-50 rounded-xl p-3">
                  <p className="font-medium">{p.proveedor}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{p.cantidad} consumos</span>
                    <span className="font-bold text-green-700">{formatCurrency(p.monto)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  );
}