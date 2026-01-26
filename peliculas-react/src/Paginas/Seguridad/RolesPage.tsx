// src/Paginas/Seguridad/RolesPermisosPage.tsx
// Gestión de Roles y Permisos - Diseño mejorado
import { useEffect, useMemo, useState } from "react";
import { getRoles, getPermisosDeRol, updatePermisosDeRol, type RolDto, type RolPermisoCheckDto } from "../../assets/api/seguridad";
import { useAuth } from "../../Context/AuthContext";

// Agrupar permisos por módulo (basado en prefijo del código)
const getModuloFromCodigo = (codigo: string): string => {
  const prefijos: Record<string, string> = {
    "admin": "Administración",
    "usuarios": "Usuarios",
    "clientes": "Clientes",
    "empresas": "Empresas",
    "proveedores": "Proveedores",
    "consumos": "Consumos",
    "cobros": "Cobros",
    "pagos": "Pagos",
    "reportes": "Reportes",
    "cxc": "Cuentas por Cobrar",
    "cxp": "Cuentas por Pagar",
    "registrar": "Operaciones",
  };
  
  const prefix = codigo.split("_")[0];
  return prefijos[prefix] || "Otros";
};

export default function RolesPermisosPage() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [rolId, setRolId] = useState<number | undefined>();
  const [permisos, setPermisos] = useState<RolPermisoCheckDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busquedaPermiso, setBusquedaPermiso] = useState("");

  // Cargar roles al montar
  useEffect(() => {
    loadRoles();
  }, []);

  // Cargar permisos cuando cambia el rol
  useEffect(() => {
    if (rolId) {
      loadPermisos(rolId);
    }
  }, [rolId]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rs = await getRoles();
      setRoles(rs);
      if (rs.length && !rolId) {
        setRolId(rs[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPermisos = async (id: number) => {
    try {
      setLoadingPermisos(true);
      setError(null);
      const ps = await getPermisosDeRol(id);
      setPermisos(ps);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.response?.data ?? "Error cargando permisos");
    } finally {
      setLoadingPermisos(false);
    }
  };

  // Estadísticas
  const selectedCount = useMemo(
    () => permisos.filter(p => p.asignado).length,
    [permisos]
  );

  const totalPermisos = permisos.length;

  // Agrupar permisos por módulo
  const permisosAgrupados = useMemo(() => {
    const grupos: Record<string, RolPermisoCheckDto[]> = {};
    
    permisos
      .filter(p => 
        p.nombre.toLowerCase().includes(busquedaPermiso.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busquedaPermiso.toLowerCase())
      )
      .forEach(p => {
        const modulo = getModuloFromCodigo(p.codigo);
        if (!grupos[modulo]) {
          grupos[modulo] = [];
        }
        grupos[modulo].push(p);
      });
    
    return grupos;
  }, [permisos, busquedaPermiso]);

  const toggle = (pid: number) => {
    setPermisos(prev => prev.map(p => p.id === pid ? { ...p, asignado: !p.asignado } : p));
  };

  const selectAll = (v: boolean) => {
    setPermisos(prev => prev.map(p => ({ ...p, asignado: v })));
  };

  const selectModulo = (modulo: string, v: boolean) => {
    const idsModulo = permisosAgrupados[modulo]?.map(p => p.id) || [];
    setPermisos(prev => prev.map(p => 
      idsModulo.includes(p.id) ? { ...p, asignado: v } : p
    ));
  };

  const save = async () => {
    if (!rolId) return;
    try {
      setSaving(true);
      setError(null);
      const ids = permisos.filter(p => p.asignado).map(p => p.id);
      await updatePermisosDeRol(rolId, ids);
      setSuccessMsg("Permisos guardados correctamente");
      setTimeout(() => setSuccessMsg(null), 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.response?.data ?? "Error guardando permisos");
    } finally {
      setSaving(false);
    }
  };

  const rolSeleccionado = roles.find(r => r.id === rolId);

  if (!hasPermission("admin_roles")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
            <p className="text-gray-500 mt-1">Configura los permisos de acceso para cada rol del sistema</p>
          </div>
          {rolSeleccionado && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Permisos asignados</p>
              <p className="text-2xl font-bold text-sky-600">{selectedCount} <span className="text-gray-400 text-lg">/ {totalPermisos}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-3">
          <span className="text-xl">✅</span>
          <p>{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel de Roles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Roles del Sistema</h3>
              <p className="text-xs text-gray-500 mt-1">{roles.length} roles disponibles</p>
            </div>

            {loading && !roles.length ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
              </div>
            ) : (
              <div className="p-2">
                {roles.map(r => {
                 // console.table(roles.map(r => ({ id: r.id, nombre: r.nombre })));
                  const isSelected = rolId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRolId(r.id)}
                      className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${
                        isSelected
                          ? "bg-sky-50 border-2 border-sky-200"
                          : "hover:bg-gray-50 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          {r.nombre === "Administrador" ? "👑" : 
                           r.nombre === "Supervisor" ? "👔" : 
                           r.nombre === "Cajero" ? "💳" : "👤"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isSelected ? "text-sky-700" : "text-gray-900"}`}>
                            {r.nombre}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {r.descripcion || "Sin descripción"}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-sky-500">→</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel de Permisos */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Header del panel */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Permisos {rolSeleccionado && `de "${rolSeleccionado.nombre}"`}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Marca los permisos que deseas asignar a este rol
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Búsqueda */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                      type="text"
                      value={busquedaPermiso}
                      onChange={(e) => setBusquedaPermiso(e.target.value)}
                      placeholder="Buscar permiso..."
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent w-48"
                    />
                  </div>

                  {/* Acciones masivas */}
                  <button
                    onClick={() => selectAll(true)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    ✓ Todo
                  </button>
                  <button
                    onClick={() => selectAll(false)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    ✕ Ninguno
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de permisos */}
            <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {loadingPermisos ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Cargando permisos...</p>
                </div>
              ) : !rolId ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👈</span>
                  </div>
                  <p className="text-gray-500">Selecciona un rol para ver sus permisos</p>
                </div>
              ) : Object.keys(permisosAgrupados).length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-gray-500">No se encontraron permisos</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permisosAgrupados).map(([modulo, permisosModulo]) => {
                    const asignadosModulo = permisosModulo.filter(p => p.asignado).length;
                    const todosAsignados = asignadosModulo === permisosModulo.length;
                    const algunoAsignado = asignadosModulo > 0;

                    return (
                      <div key={modulo} className="border border-gray-100 rounded-xl overflow-hidden">
                        {/* Header del módulo */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => selectModulo(modulo, !todosAsignados)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                todosAsignados
                                  ? "bg-sky-500 border-sky-500 text-white"
                                  : algunoAsignado
                                  ? "bg-sky-200 border-sky-300"
                                  : "border-gray-300 hover:border-sky-400"
                              }`}
                            >
                              {todosAsignados && <span className="text-xs">✓</span>}
                              {algunoAsignado && !todosAsignados && <span className="text-xs text-sky-600">−</span>}
                            </button>
                            <span className="font-medium text-gray-700">{modulo}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {asignadosModulo} / {permisosModulo.length}
                          </span>
                        </div>

                        {/* Lista de permisos del módulo */}
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permisosModulo.map(p => (
                            <label
                              key={p.id}
                              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                p.asignado
                                  ? "bg-sky-50 border border-sky-200"
                                  : "bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={p.asignado}
                                onChange={() => toggle(p.id)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${p.asignado ? "text-sky-700" : "text-gray-900"}`}>
                                  {p.nombre}
                                </p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                  {p.codigo}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer con botón guardar */}
            {rolId && permisos.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {selectedCount} permisos seleccionados de {totalPermisos}
                </p>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      💾 Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}