// src/Paginas/Pagos/RefinanciamientosPage.tsx
// Página de lista de refinanciamientos

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { refinanciamientoApi, type RefinanciamientoListItem, type EstadoRefinanciamiento } from "../../Servicios/pagosApi";

const ESTADOS_REF: { value: EstadoRefinanciamiento | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "ParcialmentePagado", label: "Parcialmente Pagado" },
  { value: "Vencido", label: "Vencido" },
  { value: "Pagado", label: "Pagado" },
  { value: "Castigado", label: "Castigado" },
];

export default function RefinanciamientosPage() {
  const [rows, setRows] = useState<RefinanciamientoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [estado, setEstado] = useState<EstadoRefinanciamiento | "">("");

  // Resumen
  const [resumen, setResumen] = useState<{
    totalRefinanciamientos: number;
    montoTotalPendiente: number;
    cantidadVencidos: number;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await refinanciamientoApi.listar({
        estado: estado || undefined,
        page,
        pageSize,
      });
      setRows(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
      if (res.resumen) {
        setResumen(res.resumen as typeof resumen);
      }
    } catch (error) {
      console.error("Error cargando refinanciamientos:", error);
    } finally {
      setLoading(false);
    }
  }, [estado, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-DO");
  };

  const getEstadoBadge = (estado: string, diasVencido: number) => {
    const baseClass = "px-2 py-1 rounded text-xs font-medium";
    switch (estado) {
      case "Pendiente":
        return <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>Pendiente</span>;
      case "ParcialmentePagado":
        return <span className={`${baseClass} bg-blue-100 text-blue-700`}>Parcial</span>;
      case "Pagado":
        return <span className={`${baseClass} bg-green-100 text-green-700`}>Pagado</span>;
      case "Vencido":
        return (
          <span className={`${baseClass} bg-red-100 text-red-700`}>
            Vencido ({diasVencido}d)
          </span>
        );
      case "Castigado":
        return <span className={`${baseClass} bg-gray-800 text-white`}>Castigado</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>{estado}</span>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Refinanciamientos</h1>
          <p className="text-sm text-gray-500 mt-1">Deudas refinanciadas de empresas</p>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">Total Refinanciamientos</p>
            <p className="text-xl font-bold text-gray-900">{resumen.totalRefinanciamientos}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">Monto Pendiente</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(resumen.montoTotalPendiente)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">Vencidos</p>
            <p className="text-xl font-bold text-red-600">{resumen.cantidadVencidos}</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-purple-50 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="font-medium text-purple-900">¿Qué es el refinanciamiento?</p>
            <p className="text-sm text-purple-700 mt-1">
              Cuando una empresa no paga su factura, se puede refinanciar la deuda. Esto permite que 
              los empleados de esa empresa recuperen su crédito disponible mientras la empresa tiene 
              un nuevo plazo para pagar.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value as EstadoRefinanciamiento | "");
                setPage(1);
              }}
              className="rounded-xl border px-3 py-2 min-w-[180px]"
            >
              {ESTADOS_REF.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEstado("");
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-700"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Número</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Empresa</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Doc. Original</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Vencimiento</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Pagado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Pendiente</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No hay refinanciamientos para mostrar
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/pagos/refinanciamiento/${row.id}`}
                        className="text-purple-600 hover:underline font-medium"
                      >
                        {row.numeroRefinanciamiento}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">{row.empresaNombre}</td>
                    <td className="px-4 py-3 text-gray-600">{row.documentoOriginal}</td>
                    <td className="px-4 py-3">{formatDate(row.fecha)}</td>
                    <td className="px-4 py-3">
                      <span className={row.diasVencido > 0 ? "text-red-600 font-medium" : ""}>
                        {formatDate(row.fechaVencimiento)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(row.montoOriginal)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatCurrency(row.montoPagado)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-purple-600">
                      {formatCurrency(row.montoPendiente)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getEstadoBadge(row.estadoNombre, row.diasVencido)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {row.estadoNombre !== "Pagado" && row.estadoNombre !== "Castigado" && (
                          <Link
                            to={`/pagos/refinanciamiento/${row.id}/pagar`}
                            className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs"
                          >
                            Pagar
                          </Link>
                        )}
                        <Link
                          to={`/pagos/refinanciamiento/${row.id}`}
                          className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-xs"
                        >
                          Ver
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}