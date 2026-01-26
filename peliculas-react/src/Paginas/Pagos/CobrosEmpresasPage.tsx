// src/Paginas/Pagos/CobrosEmpresasPage.tsx
// Página principal de Cobros a Empresas (CxC)

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { cobrosApi, type CxcDocumentoListItem, type EstadoCxc } from "../../Servicios/pagosApi";

const ESTADOS_CXC: { value: EstadoCxc | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "ParcialmentePagado", label: "Parcialmente Pagado" },
  { value: "Vencido", label: "Vencido" },
  { value: "Pagado", label: "Pagado" },
  { value: "Refinanciado", label: "Refinanciado" },
];

export default function CobrosEmpresasPage() {
  const [rows, setRows] = useState<CxcDocumentoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [estado, setEstado] = useState<EstadoCxc | "">("");
  const [soloVencidos, setSoloVencidos] = useState(false);

  // Resumen
  const [resumen, setResumen] = useState<{
    totalDocumentos: number;
    montoTotalFacturado: number;
    montoTotalCobrado: number;
    montoTotalPendiente: number;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cobrosApi.listarDocumentos({
        estado: estado || undefined,
        soloVencidos: soloVencidos || undefined,
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
      console.error("Error cargando documentos:", error);
    } finally {
      setLoading(false);
    }
  }, [estado, soloVencidos, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiltrar = () => {
    setPage(1);
    load();
  };

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
      case "Refinanciado":
        return <span className={`${baseClass} bg-purple-100 text-purple-700`}>Refinanciado</span>;
      case "Anulado":
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>Anulado</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>{estado}</span>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cobros a Empresas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de cuentas por cobrar (CxC)</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/pagos/cobros/generar"
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors"
          >
            Generar Corte
          </Link>
          <Link
            to="/pagos/cobros/nuevo"
            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Registrar Cobro
          </Link>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">Total Facturado</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(resumen.montoTotalFacturado)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">Total Cobrado</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(resumen.montoTotalCobrado)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">Pendiente por Cobrar</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(resumen.montoTotalPendiente)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">Documentos</p>
            <p className="text-xl font-bold text-gray-900">{resumen.totalDocumentos}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoCxc | "")}
              className="rounded-xl border px-3 py-2 min-w-[180px]"
            >
              {ESTADOS_CXC.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="soloVencidos"
              checked={soloVencidos}
              onChange={(e) => setSoloVencidos(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="soloVencidos" className="text-sm text-gray-600">
              Solo vencidos
            </label>
          </div>
          <button
            onClick={handleFiltrar}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50 transition-colors"
          >
            Filtrar
          </button>
          <button
            onClick={() => {
              setEstado("");
              setSoloVencidos(false);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-700"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Documento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Empresa</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Período</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Vencimiento</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Pagado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Pendiente</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No hay documentos para mostrar
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/pagos/cobros/documento/${row.id}`}
                        className="text-sky-600 hover:underline font-medium"
                      >
                        {row.numeroDocumento}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{row.empresaNombre}</p>
                        <p className="text-xs text-gray-500">{row.empresaRnc}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(row.periodoDesde)} - {formatDate(row.periodoHasta)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={row.diasVencido > 0 ? "text-red-600 font-medium" : ""}>
                        {formatDate(row.fechaVencimiento)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(row.montoTotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatCurrency(row.montoPagado)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-orange-600">
                      {formatCurrency(row.montoPendiente)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getEstadoBadge(row.estadoNombre, row.diasVencido)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {row.estadoNombre !== "Pagado" && row.estadoNombre !== "Anulado" && !row.refinanciado && (
                          <Link
                            to={`/pagos/cobros/pagar/${row.id}`}
                            className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                          >
                            Cobrar
                          </Link>
                        )}
                        <Link
                          to={`/pagos/cobros/documento/${row.id}`}
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