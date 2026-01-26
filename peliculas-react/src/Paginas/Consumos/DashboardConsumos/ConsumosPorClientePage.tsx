
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../Servicios/api";

interface ClienteConsumo {
  clienteId: number;
  clienteNombre: string;
  clienteCedula: string | null;
  saldoActual: number;
  limite: number;
  empresaNombre: string;
  totalConsumos: number;
  montoConsumido: number;
  reversos: number;
  ultimoConsumo: string;
}

interface Empresa {
  id: number;
  nombre: string;
}

export default function ConsumosPorClientePage() {
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState<ClienteConsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 0 });

  const [empresaId, setEmpresaId] = useState(searchParams.get("empresaId") || "");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);

  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    loadEmpresas();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadEmpresas = async () => {
    try {
      const { data } = await api.get("/empresas");
      setEmpresas(data.data || data || []);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (empresaId) params.append("empresaId", empresaId);
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      params.append("page", page.toString());
      params.append("pageSize", "20");

      const { data: result } = await api.get(`/modulo-consumos/por-cliente?${params}`);
      setClientes(result.data || []);
      setPagination(result.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 });
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPage(1);
    loadData();
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-DO");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <span className="text-gray-900">Por Cliente</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Consumos por Cliente</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de consumos agrupados por cliente/empleado</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
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
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Cédula</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Empresa</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Saldo</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Límite</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Consumos</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Reversos</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Último</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientes.length > 0 ? (
                    clientes.map((cliente) => (
                      <tr key={cliente.clienteId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link to={`/clientes/editar/${cliente.clienteId}`} className="font-medium text-sky-600 hover:underline">
                            {cliente.clienteNombre}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{cliente.clienteCedula || "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{cliente.empresaNombre}</td>
                        <td className="px-4 py-3 text-right text-green-700 font-medium">
                          {formatCurrency(cliente.saldoActual)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatCurrency(cliente.limite)}
                        </td>
                        <td className="px-4 py-3 text-right">{cliente.totalConsumos}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(cliente.montoConsumido)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {cliente.reversos > 0 ? (
                            <span className="text-red-600">{cliente.reversos}</span>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                          {formatDateTime(cliente.ultimoConsumo)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/modulo-consumos/lista?clienteId=${cliente.clienteId}`}
                            className="text-sky-600 hover:underline text-sm"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        No se encontraron datos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Página {page} de {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}