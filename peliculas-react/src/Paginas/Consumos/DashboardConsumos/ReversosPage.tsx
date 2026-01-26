import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";

interface Reverso {
  id: number;
  fechaConsumo: string;
  fechaReverso: string;
  clienteNombre: string;
  clienteCedula: string | null;
  empresaNombre: string;
  proveedorNombre: string;
  tiendaNombre: string | null;
  monto: number;
  concepto: string | null;
  motivoReverso: string | null;
  reversadoPor: string | null;
}

interface Empresa {
  id: number;
  nombre: string;
}

export default function ReversosPage() {
  const [reversos, setReversos] = useState<Reverso[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({ totalReversos: 0, montoTotalReversado: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 0 });

  // Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [empresaId, setEmpresaId] = useState("");
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
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (empresaId) params.append("empresaId", empresaId);
      params.append("page", page.toString());
      params.append("pageSize", "20");

      const { data: result } = await api.get(`/modulo-consumos/reversos?${params}`);
      setReversos(result.data || []);
      setResumen(result.resumen || { totalReversos: 0, montoTotalReversado: 0 });
      setPagination(result.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 });
    } catch (error) {
      console.error("Error cargando reversos:", error);
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <span className="text-gray-900">Reversos</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Consumos Reversados</h1>
        <p className="text-sm text-gray-500 mt-1">Historial de todos los consumos que han sido reversados</p>
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
          <button
            onClick={handleBuscar}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
          >
            🔍 Buscar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 rounded-2xl shadow p-4">
          <p className="text-sm text-red-600">Total Reversos</p>
          <p className="text-3xl font-bold text-red-700">{resumen.totalReversos}</p>
        </div>
        <div className="bg-red-50 rounded-2xl shadow p-4">
          <p className="text-sm text-red-600">Monto Total Reversado</p>
          <p className="text-3xl font-bold text-red-700">{formatCurrency(resumen.montoTotalReversado)}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha Consumo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha Reverso</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Empresa</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Proveedor</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Motivo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Reversado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reversos.length > 0 ? (
                    reversos.map((reverso) => (
                      <tr key={reverso.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link to={`/modulo-consumos/${reverso.id}`} className="text-sky-600 hover:underline">
                            #{reverso.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatDateTime(reverso.fechaConsumo)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatDateTime(reverso.fechaReverso)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{reverso.clienteNombre}</p>
                          {reverso.clienteCedula && (
                            <p className="text-xs text-gray-400">{reverso.clienteCedula}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{reverso.empresaNombre}</td>
                        <td className="px-4 py-3">
                          <p>{reverso.proveedorNombre}</p>
                          {reverso.tiendaNombre && (
                            <p className="text-xs text-gray-400">{reverso.tiendaNombre}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">
                          {formatCurrency(reverso.monto)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate" title={reverso.motivoReverso || ""}>
                          {reverso.motivoReverso || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {reverso.reversadoPor || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No se encontraron reversos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {(page - 1) * 20 + 1} - {Math.min(page * 20, pagination.total)} de {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                  >
                    ← Anterior
                  </button>
                  <span className="px-3 py-1">
                    Página {page} de {pagination.totalPages}
                  </span>
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