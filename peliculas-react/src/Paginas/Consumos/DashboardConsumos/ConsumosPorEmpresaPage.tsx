
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";

interface EmpresaConsumo {
  empresaId: number;
  empresaNombre: string;
  empresaRnc: string | null;
  totalConsumos: number;
  consumosActivos: number;
  consumosReversados: number;
  montoActivo: number;
  montoReversado: number;
  clientesUnicos: number;
}

export default function ConsumosPorEmpresaPage() {
  const [empresas, setEmpresas] = useState<EmpresaConsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({ totalEmpresas: 0, totalConsumos: 0, montoTotal: 0, montoReversado: 0 });

  // Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const { data: result } = await api.get(`/modulo-consumos/por-empresa?${params}`);
      setEmpresas(result.data || []);
      setResumen(result.resumen || { totalEmpresas: 0, totalConsumos: 0, montoTotal: 0, montoReversado: 0 });
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    loadData();
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <span className="text-gray-900">Por Empresa</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Consumos por Empresa</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de consumos agrupados por empresa cliente</p>
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
              className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={handleBuscar}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
          >
            🔍 Filtrar
          </button>
          <button
            onClick={() => { setDesde(""); setHasta(""); loadData(); }}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Empresas</p>
          <p className="text-2xl font-bold">{resumen.totalEmpresas}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Consumos</p>
          <p className="text-2xl font-bold">{resumen.totalConsumos}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-green-600">Monto Activo</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(resumen.montoTotal)}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-red-600">Monto Reversado</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(resumen.montoReversado)}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Empresa</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">RNC</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Consumos</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Activos</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Reversados</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Monto Activo</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Monto Reversado</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Clientes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empresas.length > 0 ? (
                  empresas.map((empresa) => (
                    <tr key={empresa.empresaId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/empresas/${empresa.empresaId}`} className="font-medium text-sky-600 hover:underline">
                          {empresa.empresaNombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{empresa.empresaRnc || "-"}</td>
                      <td className="px-4 py-3 text-right">{empresa.totalConsumos}</td>
                      <td className="px-4 py-3 text-right text-green-700">{empresa.consumosActivos}</td>
                      <td className="px-4 py-3 text-right text-red-600">{empresa.consumosReversados}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">
                        {formatCurrency(empresa.montoActivo)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {empresa.montoReversado > 0 ? formatCurrency(empresa.montoReversado) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">{empresa.clientesUnicos}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/modulo-consumos/lista?empresaId=${empresa.empresaId}`}
                          className="text-sky-600 hover:underline text-sm"
                        >
                          Ver consumos
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}