// src/Paginas/Seguridad/UsuariosList.tsx

import { useEffect, useState } from "react";
import UserModal from "../../Componentes/UserModal";
import ResetPasswordModal from "../../Paginas/Seguridad/PasswordModal";
import segApi from "../../assets/api/usuarios";

type Rol = { id: number; nombre: string };
type UsuarioRow = {
  id: number;
  nombre: string;
  rol: string;
  rolId: number;
  activo: boolean;
  creado?: string | null;
};

export default function UsuariosList() {
  const [rows, setRows] = useState<UsuarioRow[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("");
  const [filtroActivo, setFiltroActivo] = useState<string>("");

  // Modal crear/editar
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<{ id: number; nombre: string; rolId: number; activo: boolean } | null>(null);

  // Modal cambiar contraseña
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);

  const formatDate = (s?: string | null) => {
    if (!s) return "-";
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const rs = await segApi.listRoles();
      setRoles(rs);

      const { data } = await segApi.listUsuarios();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: UsuarioRow[] = (data ?? []).map((x: any) => ({
        id: x.id,
        nombre: x.nombre,
        rol: x.rol ?? x.rolNombre,
        rolId: x.rolId ?? 0,
        activo: x.activo,
        creado: x.creadoUtc ?? x.creado,
      }));

      setRows(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onNew = () => {
    setMode("create");
    setCurrent(null);
    setOpen(true);
  };

  const onEdit = async (row: UsuarioRow) => {
    setMode("edit");
    let rolId = row.rolId;
    if (!rolId) {
      const detail = await segApi.getUsuario(row.id);
      rolId = detail.rolId;
    }
    setCurrent({ id: row.id, nombre: row.nombre, rolId, activo: row.activo });
    setOpen(true);
  };

  const onResetPassword = (id: number) => {
    setResetUserId(id);
    setResetOpen(true);
  };

  // Filtrar usuarios
  const usuariosFiltrados = rows.filter((r) => {
    const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = !filtroRol || r.rol === filtroRol;
    const matchActivo = filtroActivo === "" || r.activo === (filtroActivo === "true");
    return matchBusqueda && matchRol && matchActivo;
  });

  // Obtener roles únicos para el filtro
  const rolesUnicos = [...new Set(rows.map(r => r.rol))].filter(Boolean);

  // Estadísticas
  const totalActivos = rows.filter(r => r.activo).length;
  const totalInactivos = rows.filter(r => !r.activo).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
            <p className="text-gray-500 mt-1">Gestiona los usuarios y sus permisos de acceso</p>
          </div>
          <button
            onClick={onNew}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <span className="text-lg">+</span>
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
              <p className="text-sm text-gray-500">Total Usuarios</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalActivos}</p>
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
              <p className="text-2xl font-bold text-gray-400">{totalInactivos}</p>
              <p className="text-sm text-gray-500">Inactivos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* Filtro por rol */}
          <div className="w-48">
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Todos los roles</option>
              {rolesUnicos.map((rol) => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div className="w-40">
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {/* Limpiar filtros */}
          {(busqueda || filtroRol || filtroActivo) && (
            <button
              onClick={() => {
                setBusqueda("");
                setFiltroRol("");
                setFiltroActivo("");
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
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {rows.length === 0 ? "No hay usuarios" : "Sin resultados"}
            </h3>
            <p className="text-gray-500 text-sm">
              {rows.length === 0 
                ? "Crea el primer usuario del sistema"
                : "Intenta con otros filtros de búsqueda"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuariosFiltrados.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    {/* Usuario */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                          r.activo ? "bg-sky-500" : "bg-gray-400"
                        }`}>
                          {r.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{r.nombre}</p>
                          <p className="text-xs text-gray-400">ID: {r.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                        {r.rol || "Sin rol"}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        r.activo 
                          ? "bg-green-50 text-green-700" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${r.activo ? "bg-green-500" : "bg-gray-400"}`}></span>
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Creado */}
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {formatDate(r.creado)}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(r)}
                          className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onResetPassword(r.id)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Cambiar contraseña"
                        >
                          🔑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer con conteo */}
        {!loading && usuariosFiltrados.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {usuariosFiltrados.length} de {rows.length} usuarios
            </p>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <UserModal
        open={open}
        mode={mode}
        roles={roles}
        user={current}
        onClose={() => setOpen(false)}
        onSaved={load}
      />

      {/* Modal Cambiar contraseña */}
      <ResetPasswordModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        userId={resetUserId}
      />
    </div>
  );
}