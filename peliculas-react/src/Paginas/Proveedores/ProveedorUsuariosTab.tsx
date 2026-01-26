
  // Componentes/Proveedores/ProveedorUsuariosTab.tsx
// ACTUALIZADO: Con editar usuario, resetear contraseña y estadísticas
import { useEffect, useState } from "react";
import api from "../../Servicios/api";

import EditarUsuarioModal from "../../Componentes/Usuarios/EditarUsuarioModal";
import EstadisticasUsuarioModal from "../../Componentes/Usuarios/EstadisticasUsuarioModal";
import ResetearContrasenaModal from "../../Componentes/Usuarios/ResetearContrasenaModal";

type Asignacion = {
  asignacionId: number;
  tiendaId: number | null;
  tiendaNombre: string | null;
  cajaId: number | null;
  cajaNombre: string | null;
  rol: string;
  nivel: string;
  activo: boolean;
};

type UsuarioCajero = {
  usuarioId: number;
  nombre: string;
  activo: boolean;
  totalAsignaciones: number;
  asignaciones: Asignacion[];
};

type Tienda = {
  id: number;
  nombre: string;
  activo: boolean;
};

type Caja = {
  id: number;
  nombre: string;
  activo: boolean;
};

type RolOption = {
  value: string;
  label: string;
  descripcion: string;
  requiereTienda: boolean;
  requiereCaja: boolean;
};

const ROLES: RolOption[] = [
  {
    value: "cajero",
    label: "Cajero",
    descripcion: "Acceso solo a una caja específica",
    requiereTienda: true,
    requiereCaja: true
  },
  {
    value: "supervisor",
    label: "Supervisor de Tienda",
    descripcion: "Acceso a todas las cajas de una tienda",
    requiereTienda: true,
    requiereCaja: false
  },
  {
    value: "admin",
    label: "Administrador",
    descripcion: "Acceso total a todas las tiendas y cajas",
    requiereTienda: false,
    requiereCaja: false
  }
];

export default function ProveedorUsuariosTab({ proveedorId }: { proveedorId: number }) {
  const [usuarios, setUsuarios] = useState<UsuarioCajero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [usuarioResetear, setUsuarioResetear] = useState<{ id: number; nombre: string } | null>(null);
  const [usuarioEditar, setUsuarioEditar] = useState<{ id: number; nombre: string } | null>(null);
  const [usuarioEstadisticas, setUsuarioEstadisticas] = useState<number | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, [proveedorId]);

  const loadUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/proveedores/${proveedorId}/usuarios`);
      setUsuarios(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error cargando usuarios:", error);
      setError(error?.response?.data?.message || "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUsuario = async (usuarioId: number, activo: boolean) => {
    const accion = activo ? "desactivar" : "activar";
    if (!confirm(`¿${activo ? "Desactivar" : "Activar"} este usuario?`)) return;

    try {
      await api.patch(`/proveedores/${proveedorId}/usuarios/${usuarioId}/${accion}`);
      loadUsuarios();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || `Error al ${accion} usuario`);
    }
  };

  const handleEliminarAsignacion = async (asignacionId: number) => {
    if (!confirm("¿Eliminar esta asignación?")) return;

    try {
      await api.delete(`/proveedores/${proveedorId}/asignaciones/${asignacionId}`);
      loadUsuarios();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || "Error eliminando asignación");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={loadUsuarios} className="ml-4 underline">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Usuarios / Cajeros</h2>
          <p className="text-sm text-gray-600">
            Gestiona los usuarios que registrarán consumos
          </p>
        </div>
        <CrearUsuarioButton proveedorId={proveedorId} onCreated={loadUsuarios} />
      </div>

      {usuarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">👤</div>
          <p className="text-gray-500 mb-4">No hay usuarios registrados</p>
          <p className="text-sm text-gray-400">
            Crea un usuario para que pueda registrar consumos en las cajas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <div
              key={usuario.usuarioId}
              className={`bg-white rounded-lg shadow overflow-hidden ${
                !usuario.activo ? "opacity-60" : ""
              }`}
            >
              {/* Header del usuario */}
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      usuario.activo ? "bg-sky-600" : "bg-gray-400"
                    }`}
                  >
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {usuario.nombre}
                      <button
                        onClick={() => setUsuarioEditar({ id: usuario.usuarioId, nombre: usuario.nombre })}
                        className="text-gray-400 hover:text-sky-600 text-sm"
                        title="Editar nombre"
                      >
                        ✏️
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {usuario.totalAsignaciones} asignación(es)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      usuario.activo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                  
                  {/* Dropdown de acciones */}
                  <div className="relative group">
                    <button className="px-3 py-1.5 rounded text-sm border hover:bg-gray-50">
                      ⋮
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 hidden group-hover:block z-10">
                      <button
                        onClick={() => setUsuarioEditar({ id: usuario.usuarioId, nombre: usuario.nombre })}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        ✏️ Editar nombre
                      </button>
                      <button
                        onClick={() => setUsuarioResetear({ id: usuario.usuarioId, nombre: usuario.nombre })}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        🔑 Resetear contraseña
                      </button>
                      <button
                        onClick={() => setUsuarioEstadisticas(usuario.usuarioId)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        📊 Ver estadísticas
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => handleToggleUsuario(usuario.usuarioId, usuario.activo)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                          usuario.activo ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {usuario.activo ? "🚫 Desactivar" : "✅ Activar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asignaciones */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Asignaciones:</span>
                  {usuario.activo && (
                    <AgregarAsignacionButton
                      proveedorId={proveedorId}
                      usuarioId={usuario.usuarioId}
                      onCreated={loadUsuarios}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  {usuario.asignaciones.map((asig) => (
                    <div
                      key={asig.asignacionId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        asig.activo ? "bg-gray-50" : "bg-gray-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RolBadge rol={asig.rol} />
                        <div>
                          <div className="text-sm font-medium">
                            {asig.rol === "admin" ? (
                              "Acceso completo"
                            ) : asig.rol === "supervisor" ? (
                              <>Tienda: {asig.tiendaNombre}</>
                            ) : (
                              <>
                                {asig.tiendaNombre} → {asig.cajaNombre}
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{asig.nivel}</div>
                        </div>
                      </div>
                      {usuario.totalAsignaciones > 1 && (
                        <button
                          onClick={() => handleEliminarAsignacion(asig.asignacionId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Eliminar asignación"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Resetear Contraseña */}
      {usuarioResetear && (
        <ResetearContrasenaModal
          isOpen={true}
          onClose={() => setUsuarioResetear(null)}
          usuarioId={usuarioResetear.id}
          usuarioNombre={usuarioResetear.nombre}
          onSuccess={loadUsuarios}
        />
      )}

      {/* Modal Editar Usuario */}
      {usuarioEditar && (
        <EditarUsuarioModal
          isOpen={true}
          onClose={() => setUsuarioEditar(null)}
          usuarioId={usuarioEditar.id}
          nombreActual={usuarioEditar.nombre}
          onSuccess={loadUsuarios}
        />
      )}

      {/* Modal Estadísticas */}
      {usuarioEstadisticas && (
        <EstadisticasUsuarioModal
          isOpen={true}
          onClose={() => setUsuarioEstadisticas(null)}
          usuarioId={usuarioEstadisticas}
        />
      )}
    </div>
  );
}

// ===== COMPONENTE: Badge de Rol =====
function RolBadge({ rol }: { rol: string }) {
  const config: Record<string, { bg: string; text: string; icon: string }> = {
    admin: { bg: "bg-purple-100", text: "text-purple-700", icon: "👑" },
    supervisor: { bg: "bg-blue-100", text: "text-blue-700", icon: "👔" },
    cajero: { bg: "bg-green-100", text: "text-green-700", icon: "💳" }
  };

  const c = config[rol] || config.cajero;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon} {rol.charAt(0).toUpperCase() + rol.slice(1)}
    </span>
  );
}

// ===== COMPONENTE: Crear Usuario =====
function CrearUsuarioButton({
  proveedorId,
  onCreated
}: {
  proveedorId: number;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState<string>("cajero");
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const [cajaId, setCajaId] = useState<number | null>(null);

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const rolActual = ROLES.find((r) => r.value === rol)!;

  useEffect(() => {
    if (open) {
      loadTiendas();
    }
  }, [open]);

  useEffect(() => {
    if (tiendaId) {
      loadCajas(tiendaId);
    } else {
      setCajas([]);
      setCajaId(null);
    }
  }, [tiendaId]);

  useEffect(() => {
    if (!rolActual.requiereTienda) {
      setTiendaId(null);
      setCajaId(null);
    }
    if (!rolActual.requiereCaja) {
      setCajaId(null);
    }
  }, [rol]);

  const loadTiendas = async () => {
    try {
      const response = await api.get(`/proveedores/${proveedorId}`);
      setTiendas(response.data.tiendas || []);
    } catch (err) {
      console.error("Error cargando tiendas:", err);
    }
  };

  const loadCajas = async (tId: number) => {
    try {
      const response = await api.get(
        `/proveedores/${proveedorId}/tiendas/${tId}/cajas`
      );
      setCajas(response.data);
    } catch (err) {
      console.error("Error cargando cajas:", err);
    }
  };

  const generarContrasena = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setContrasena(password);
    setShowPassword(true);
  };

  const handleSave = async () => {
    setError(null);

    if (!nombre.trim()) {
      setError("El nombre de usuario es requerido");
      return;
    }

    if (!contrasena || contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (rolActual.requiereTienda && !tiendaId) {
      setError("Debe seleccionar una tienda");
      return;
    }

    if (rolActual.requiereCaja && !cajaId) {
      setError("Debe seleccionar una caja");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/proveedores/${proveedorId}/usuarios`, {
        nombre: nombre.trim(),
        contrasena,
        rol,
        tiendaId: rolActual.requiereTienda ? tiendaId : null,
        cajaId: rolActual.requiereCaja ? cajaId : null
      });

      alert(`Usuario "${nombre}" creado exitosamente.\n\nContraseña: ${contrasena}`);
      
      onCreated();
      setOpen(false);
      setNombre("");
      setContrasena("");
      setRol("cajero");
      setTiendaId(null);
      setCajaId(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || "Error creando usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
      >
        <span>+</span> Nuevo Usuario
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="ej: cajero_maria"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contraseña *
                </label>
                <div className="flex gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={generarContrasena}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    title="Generar contraseña"
                  >
                    🎲
                  </button>
                </div>
                <label className="flex items-center gap-2 mt-1 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  Mostrar contraseña
                </label>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Acceso
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{rolActual.descripcion}</p>
              </div>

              {/* Tienda */}
              {rolActual.requiereTienda && (
                <div>
                  <label className="block text-sm font-medium mb-1">Tienda *</label>
                  <select
                    value={tiendaId || ""}
                    onChange={(e) => setTiendaId(Number(e.target.value) || null)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Seleccionar tienda</option>
                    {tiendas
                      .filter((t) => t.activo)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Caja */}
              {rolActual.requiereCaja && (
                <div>
                  <label className="block text-sm font-medium mb-1">Caja *</label>
                  <select
                    value={cajaId || ""}
                    onChange={(e) => setCajaId(Number(e.target.value) || null)}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={!tiendaId}
                  >
                    <option value="">Seleccionar caja</option>
                    {cajas
                      .filter((c) => c.activo)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? "Creando..." : "Crear Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== COMPONENTE: Agregar Asignación =====
function AgregarAsignacionButton({
  proveedorId,
  usuarioId,
  onCreated
}: {
  proveedorId: number;
  usuarioId: number;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rol, setRol] = useState<string>("cajero");
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const [cajaId, setCajaId] = useState<number | null>(null);

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rolActual = ROLES.find((r) => r.value === rol)!;

  useEffect(() => {
    if (open) loadTiendas();
  }, [open]);

  useEffect(() => {
    if (tiendaId) {
      loadCajas(tiendaId);
    } else {
      setCajas([]);
      setCajaId(null);
    }
  }, [tiendaId]);

  useEffect(() => {
    if (!rolActual.requiereTienda) {
      setTiendaId(null);
      setCajaId(null);
    }
    if (!rolActual.requiereCaja) {
      setCajaId(null);
    }
  }, [rol]);

  const loadTiendas = async () => {
    try {
      const response = await api.get(`/proveedores/${proveedorId}`);
      setTiendas(response.data.tiendas || []);
    } catch (err) {
      console.error("Error cargando tiendas:", err);
    }
  };

  const loadCajas = async (tId: number) => {
    try {
      const response = await api.get(`/proveedores/${proveedorId}/tiendas/${tId}/cajas`);
      setCajas(response.data);
    } catch (err) {
      console.error("Error cargando cajas:", err);
    }
  };

  const handleSave = async () => {
    setError(null);

    if (rolActual.requiereTienda && !tiendaId) {
      setError("Debe seleccionar una tienda");
      return;
    }

    if (rolActual.requiereCaja && !cajaId) {
      setError("Debe seleccionar una caja");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/proveedores/${proveedorId}/usuarios/${usuarioId}/asignaciones`, {
        rol,
        tiendaId: rolActual.requiereTienda ? tiendaId : null,
        cajaId: rolActual.requiereCaja ? cajaId : null
      });

      onCreated();
      setOpen(false);
      setRol("cajero");
      setTiendaId(null);
      setCajaId(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || "Error creando asignación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm text-sky-600 hover:underline">
        + Agregar asignación
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-[480px] shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Agregar Asignación</h3>

            <div className="space-y-4">
              {/* Rol */}
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Acceso</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} - {r.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tienda */}
              {rolActual.requiereTienda && (
                <div>
                  <label className="block text-sm font-medium mb-1">Tienda</label>
                  <select
                    value={tiendaId || ""}
                    onChange={(e) => setTiendaId(Number(e.target.value) || null)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Seleccionar tienda</option>
                    {tiendas
                      .filter((t) => t.activo)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Caja */}
              {rolActual.requiereCaja && (
                <div>
                  <label className="block text-sm font-medium mb-1">Caja</label>
                  <select
                    value={cajaId || ""}
                    onChange={(e) => setCajaId(Number(e.target.value) || null)}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={!tiendaId}
                  >
                    <option value="">Seleccionar caja</option>
                    {cajas
                      .filter((c) => c.activo)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}