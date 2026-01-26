// src/Paginas/Empresas/EmpresasList.tsx
// Lista de empresas - Diseño mejorado
import { useEffect, useState, useCallback } from "react";
import { fetchEmpresas, type EmpresaDto } from "../../assets/api/empresa";
import { Link, useNavigate } from "react-router-dom";
import EmpresaModal from "./EmpresaModal";

export default function EmpresasList() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [rows, setRows] = useState<EmpresaDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Estado del modal
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<EmpresaDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEmpresas({ search: q, page, pageSize });
      setRows(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [q, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const goDetail = (id: number) => nav(`/empresas/${id}`);

  const abrirCrear = () => {
    setMode("create");
    setCurrent(null);
    setOpenModal(true);
  };

  const abrirEditar = (row: EmpresaDto) => {
    setMode("edit");
    setCurrent(row);
    setOpenModal(true);
  };

  // Estadísticas
  const totalEmpresas = total;
  const empresasActivas = rows.filter(r => r.activo !== false).length;
  const totalEmpleados = rows.reduce((acc, r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = (r.empleados ?? (r as any).empleadosCount ?? 0);
    return acc + count;
  }, 0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
            <p className="text-gray-500 mt-1">Gestiona las empresas y sus empleados</p>
          </div>
          <button
            onClick={abrirCrear}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <span className="text-lg">+</span>
            Nueva Empresa
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEmpresas}</p>
              <p className="text-sm text-gray-500">Total Empresas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{empresasActivas}</p>
              <p className="text-sm text-gray-500">Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{totalEmpleados}</p>
              <p className="text-sm text-gray-500">Empleados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar por RNC o nombre..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <button
            onClick={() => {
              setPage(1);
              load();
            }}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          >
            Buscar
          </button>
          {q && (
            <button
              onClick={() => {
                setQ("");
                setPage(1);
              }}
              className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando empresas...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏢</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {q ? "Sin resultados" : "No hay empresas"}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {q ? "Intenta con otros términos de búsqueda" : "Crea la primera empresa del sistema"}
            </p>
            {!q && (
              <button
                onClick={abrirCrear}
                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
              >
                + Crear Empresa
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    RNC
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Empleados
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const empleadosCount = r.empleados ?? (r as any).empleadosCount ?? 0;
                  const activo = r.activo !== false;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => goDetail(r.id)}
                    >
                      {/* Empresa */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                            activo ? "bg-sky-500" : "bg-gray-400"
                          }`}>
                            {r.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/empresas/${r.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-gray-900 hover:text-sky-600"
                            >
                              {r.nombre}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* RNC */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">{r.rnc || "—"}</span>
                      </td>

                      {/* Empleados */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-lg text-sm font-medium ${
                          empleadosCount > 0 
                            ? "bg-purple-50 text-purple-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {empleadosCount}
                        </span>
                      </td>

                      {/* Creado */}
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDate(r.creadoEn)}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          activo
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${activo ? "bg-green-500" : "bg-gray-400"}`}></span>
                          {activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirEditar(r);
                            }}
                            className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Editar empresa"
                          >
                            ✏️
                          </button>
                          <Link
                            to={`/empresas/${r.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            👁️
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && rows.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} de {total} empresas
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Empresa */}
      <EmpresaModal
        open={openModal}
        mode={mode}
        empresa={
          current
            ? {
                id: current.id,
                nombre: current.nombre,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rnc: (current as any).rnc ?? "",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                limite_Credito: (current as any).limite_Credito ?? 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                activo: (current as any).activo ?? true,
              }
            : null
        }
        onClose={() => setOpenModal(false)}
        onSaved={() => load()}
      />
    </div>
  );
}