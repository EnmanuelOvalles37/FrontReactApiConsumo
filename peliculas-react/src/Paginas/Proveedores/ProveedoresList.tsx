// src/Paginas/Proveedores/ProveedoresList.tsx
// Lista de proveedores - Diseño mejorado
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { proveedoresApi, type ProveedorTienda } from "../../Servicios/proveedoresApi";
import { useAuth } from "../../Context/AuthContext";

export default function ProveedoresList() {
  const { hasPermission, currentUser } = useAuth();
  const canView = hasPermission("proveedores_ver");
  const canEdit = hasPermission("proveedores_editar");

  const [q, setQ] = useState("");
  const [rows, setRows] = useState<ProveedorTienda[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("USER", currentUser);

  useEffect(() => {
    (async () => {
      if (!canView) return;
      setLoading(true);
      const data = await proveedoresApi.list(q);
      setRows(data);
      setLoading(false);
    })();
  }, [q, canView]);

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-500">No tienes permisos para ver esta sección.</p>
        </div>
      </div>
    );
  }

  // Estadísticas
  const totalProveedores = rows.length;
  const proveedoresActivos = rows.filter(r => r.activo).length;
  const proveedoresInactivos = rows.filter(r => !r.activo).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-gray-500 mt-1">Gestiona los proveedores, tiendas y cajas</p>
          </div>
          {canEdit && (
            <Link
              to="/proveedores/nuevo"
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
            >
              <span className="text-lg">+</span>
              Nuevo Proveedor
            </Link>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProveedores}</p>
              <p className="text-sm text-gray-500">Total Proveedores</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{proveedoresActivos}</p>
              <p className="text-sm text-gray-500">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚫</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{proveedoresInactivos}</p>
              <p className="text-sm text-gray-500">Inactivos</p>
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por RNC o nombre..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
            />
          </div>
          {q && (
            <button
              onClick={() => setQ("")}
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
            <p className="text-gray-500">Cargando proveedores...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏪</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {q ? "Sin resultados" : "No hay proveedores"}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {q ? "Intenta con otros términos de búsqueda" : "Crea el primer proveedor del sistema"}
            </p>
            {!q && canEdit && (
              <Link
                to="/proveedores/nuevo"
                className="inline-flex px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
              >
                + Crear Proveedor
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    RNC
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
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    {/* Proveedor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                          r.activo ? "bg-sky-500" : "bg-gray-400"
                        }`}>
                          {r.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{r.nombre}</p>
                        </div>
                      </div>
                    </td>

                    {/* RNC */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">{r.rnc || "—"}</span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        r.activo
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.activo ? "bg-green-500" : "bg-gray-400"}`}></span>
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Link
                            to={`/proveedores/${r.id}`}
                            className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Editar proveedor"
                          >
                            ✏️
                          </Link>
                        )}
                        <Link
                          to={`/proveedores/${r.id}/tiendas`}
                          className="px-4 py-2 text-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                        >
                          Ver tiendas →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && rows.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {rows.length} proveedor{rows.length !== 1 ? "es" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}