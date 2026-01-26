// src/Paginas/Pagos/ReporteAntiguedadCxcEmpresaPage.tsx
// Reporte de antigüedad de cuentas por cobrar agrupado por empresa

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";

interface EmpresaAntiguedad {
  empresaId: number;
  empresaNombre: string;
  empresaRnc: string;
  corriente: number;
  de1a30Dias: number;
  de31a60Dias: number;
  de61a90Dias: number;
  mas90Dias: number;
  total: number;
}

interface ResumenData {
  corriente: number;
  de1a30Dias: number;
  de31a60Dias: number;
  de61a90Dias: number;
  mas90Dias: number;
  total: number;
}

export default function ReporteAntiguedadCxcEmpresaPage() {
  const [data, setData] = useState<EmpresaAntiguedad[]>([]);
  const [resumen, setResumen] = useState<ResumenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await api.get("/reportes/pagos/antiguedad-cxc-por-empresa");
      setData(result.porEmpresa || []);
      setResumen(result.resumen);
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
          <Link to="/pagos" className="hover:text-gray-700">Pagos</Link>
          <span>→</span>
          <Link to="/pagos/reportes" className="hover:text-gray-700">Reportes</Link>
          <span>→</span>
          <span className="text-gray-900">Antigüedad CxC por Empresa</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Antigüedad CxC por Empresa</h1>
            <p className="text-sm text-gray-500 mt-1">Análisis de cartera agrupado por empresa cliente</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Resumen General */}
      {resumen && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Resumen General</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-green-600">Corriente</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(resumen.corriente)}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <p className="text-xs text-yellow-600">1-30 días</p>
              <p className="text-lg font-bold text-yellow-700">{formatCurrency(resumen.de1a30Dias)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-600">31-60 días</p>
              <p className="text-lg font-bold text-orange-700">{formatCurrency(resumen.de31a60Dias)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-red-600">61-90 días</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(resumen.de61a90Dias)}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-xs text-purple-600">+90 días</p>
              <p className="text-lg font-bold text-purple-700">{formatCurrency(resumen.mas90Dias)}</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center col-span-2 lg:col-span-2">
              <p className="text-xs text-gray-600">Total Cartera</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(resumen.total)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla por Empresa */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Empresa</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">RNC</th>
                <th className="px-4 py-3 text-right font-medium text-green-600">Corriente</th>
                <th className="px-4 py-3 text-right font-medium text-yellow-600">1-30 días</th>
                <th className="px-4 py-3 text-right font-medium text-orange-600">31-60 días</th>
                <th className="px-4 py-3 text-right font-medium text-red-600">61-90 días</th>
                <th className="px-4 py-3 text-right font-medium text-purple-600">+90 días</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((empresa) => (
                <tr key={empresa.empresaId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link 
                      to={`/pagos/reportes/antiguedad-cxc?empresaId=${empresa.empresaId}`}
                      className="font-medium text-sky-600 hover:underline"
                    >
                      {empresa.empresaNombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{empresa.empresaRnc}</td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {empresa.corriente > 0 ? formatCurrency(empresa.corriente) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-700">
                    {empresa.de1a30Dias > 0 ? formatCurrency(empresa.de1a30Dias) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-700">
                    {empresa.de31a60Dias > 0 ? formatCurrency(empresa.de31a60Dias) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-red-700">
                    {empresa.de61a90Dias > 0 ? formatCurrency(empresa.de61a90Dias) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-purple-700">
                    {empresa.mas90Dias > 0 ? formatCurrency(empresa.mas90Dias) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {formatCurrency(empresa.total)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No hay documentos pendientes de cobro
                  </td>
                </tr>
              )}
            </tbody>
            {data.length > 0 && resumen && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>TOTALES</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatCurrency(resumen.corriente)}</td>
                  <td className="px-4 py-3 text-right text-yellow-700">{formatCurrency(resumen.de1a30Dias)}</td>
                  <td className="px-4 py-3 text-right text-orange-700">{formatCurrency(resumen.de31a60Dias)}</td>
                  <td className="px-4 py-3 text-right text-red-700">{formatCurrency(resumen.de61a90Dias)}</td>
                  <td className="px-4 py-3 text-right text-purple-700">{formatCurrency(resumen.mas90Dias)}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(resumen.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}