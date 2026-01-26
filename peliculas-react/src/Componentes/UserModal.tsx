/* eslint-disable @typescript-eslint/no-explicit-any */
  /*import { useEffect, useState } from "react";
 // usa tu instancia axios con baseURL + token
import toast from "react-hot-toast";
import { usuariosApi } from "../Servicios/usuariosApi";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  roles: { id:number; nombre:string }[];
  user: { id:number; nombre:string; rolId:number; activo:boolean } | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function UserModal({ open, mode, roles, user, onClose, onSaved }: Props){
  const isEdit = mode === "edit";
  const [nombre, setNombre]   = useState("");
  const [rolId, setRolId]     = useState<number>(roles[0]?.id ?? 0);
  const [activo, setActivo]   = useState(true);
  const [password, setPass]   = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (isEdit && user){
      setNombre(user.nombre);
      setRolId(user.rolId);
      setActivo(user.activo);
      setPass("");
    } else {
      setNombre("");
      setRolId(roles[0]?.id ?? 0);
      setActivo(true);
      setPass("");
    }
  }, [open, isEdit, user, roles]);

  const save = async () => {
    try {
      setLoading(true);
      setErr(null);

      if (!nombre.trim()) { setErr("Nombre requerido"); return; }
      if (!rolId)         { setErr("Rol requerido"); return; }
      if (!isEdit && !password.trim()) { setErr("Contraseña requerida"); return; }

      if (!isEdit) {
        await usuariosApi.create({
          nombre: nombre.trim(),
          contrasena: password.trim(),
          rolId,
          activo
        });
        toast.success("Usuario creado");
      } else {
        await usuariosApi.update(user!.id, {
          nombre: nombre.trim(),
          rolId,
          activo
        });
        toast.success("Usuario actualizado");
      }

      onSaved();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "No se pudo guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">
          {isEdit ? "Editar usuario" : "Nuevo usuario"}
        </h3>

        <div className="mt-4 grid gap-3">
          <label className="text-sm">
            Usuario
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="usuario"
            />
          </label>

          {!isEdit && (
            <label className="text-sm">
              Contraseña
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                type="password"
                value={password}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
              />
            </label>
          )}

          <label className="text-sm">
            Rol
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={rolId}
              onChange={e => setRolId(Number(e.target.value))}
            >
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activo}
              onChange={e => setActivo(e.target.checked)}
            />
            Activo
          </label>

          {err && <div className="rounded-lg bg-red-50 text-red-700 p-2 text-sm">{err}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 border">Cancelar</button>
          <button
            onClick={save}
            disabled={loading}
            className="rounded-lg px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
} */

  import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usuariosApi } from "../Servicios/usuariosApi";
import api from "../Servicios/api";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  roles: { id: number; nombre: string }[];
  user: { id: number; nombre: string; rolId: number; activo: boolean } | null;
  onClose: () => void;
  onSaved: () => void;
};

type Empresa = { id: number; nombre: string; rnc: string };
type Proveedor = { id: number; nombre: string; rnc: string };

export default function UserModal({ open, mode, roles, user, onClose, onSaved }: Props) {
  const isEdit = mode === "edit";
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [rolId, setRolId] = useState<number>(roles[0]?.id ?? 0);
  const [activo, setActivo] = useState(true);
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  
  // Estados para empresa/proveedor
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // IDs de roles especiales
  const ROL_EMPLEADOR = 4;
  const ROL_BACKOFFICE = 5;

  // Cargar empresas y proveedores al abrir el modal
  useEffect(() => {
    if (!open) return;
    
    const cargarDatos = async () => {
      setLoadingData(true);
      try {
        const [empRes, provRes] = await Promise.all([
          api.get("/empresas?activo=true&pageSize=500"),
          api.get("/proveedores?activo=true&pageSize=500")
        ]);
        setEmpresas(empRes.data.data || empRes.data || []);
        setProveedores(provRes.data.data || provRes.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoadingData(false);
      }
    };
    
    cargarDatos();
  }, [open]);

  // Inicializar formulario
  useEffect(() => {
    if (!open) return;
    setErr(null);
    
    if (isEdit && user) {
      setNombre(user.nombre);
      setRolId(user.rolId);
      setActivo(user.activo);
      setPass("");
      setConfirmPass("");
      setEmpresaId(null);
      setProveedorId(null);
      // TODO: Cargar empresa/proveedor asociado si existe
    } else {
      setNombre("");
      setRolId(roles[0]?.id ?? 0);
      setActivo(true);
      setPass("");
      setConfirmPass("");
      setEmpresaId(null);
      setProveedorId(null);
    }
  }, [open, isEdit, user, roles]);

  // Limpiar selección al cambiar de rol
  useEffect(() => {
    if (rolId !== ROL_EMPLEADOR) setEmpresaId(null);
    if (rolId !== ROL_BACKOFFICE) setProveedorId(null);
  }, [rolId]);

  const getRolNombre = (id: number) => {
    return roles.find(r => r.id === id)?.nombre || "";
  };

  const validar = (): boolean => {
    if (!nombre.trim()) {
      setErr("El nombre de usuario es requerido");
      return false;
    }
    
    if (!rolId) {
      setErr("Debe seleccionar un rol");
      return false;
    }
    
    if (!isEdit) {
      if (!password.trim()) {
        setErr("La contraseña es requerida");
        return false;
      }
      if (password.length < 4) {
        setErr("La contraseña debe tener al menos 4 caracteres");
        return false;
      }
      if (password !== confirmPassword) {
        setErr("Las contraseñas no coinciden");
        return false;
      }
    }
    
    // Validar selección de empresa/proveedor según rol
    if (rolId === ROL_EMPLEADOR && !empresaId) {
      setErr("Debe seleccionar una empresa para el rol Empleador");
      return false;
    }
    
    if (rolId === ROL_BACKOFFICE && !proveedorId) {
      setErr("Debe seleccionar un proveedor para el rol Backoffice");
      return false;
    }
    
    return true;
  };

  const save = async () => {
    if (!validar()) return;
    
    try {
      setLoading(true);
      setErr(null);

      if (!isEdit) {
        // Crear usuario
        const nuevoUsuario = await usuariosApi.create({
          nombre: nombre.trim(),
          contrasena: password.trim(),
          rolId,
          activo
        });

        const usuarioId = nuevoUsuario.data || nuevoUsuario;

        // Si es empleador, asociar con empresa
        if (rolId === ROL_EMPLEADOR && empresaId) {
          await api.post("/usuarios/asociar-empresa", {
            usuarioId,
            empresaId
          });
        }

        // Si es backoffice, asociar con proveedor
        if (rolId === ROL_BACKOFFICE && proveedorId) {
          await api.post("/usuarios/asociar-proveedor", {
            usuarioId,
            proveedorId
          });
        }

        toast.success("Usuario creado exitosamente");
      } else {
        // Actualizar usuario
        await usuariosApi.update(user!.id, {
          nombre: nombre.trim(),
          rolId,
          activo
        });
        toast.success("Usuario actualizado exitosamente");
      }

      onSaved();
      onClose();
    } catch (e: any) {
      const mensaje = e?.response?.data?.message || e?.response?.data || "No se pudo guardar el usuario";
      setErr(mensaje);
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">{isEdit ? "✏️" : "👤"}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
                </h3>
                <p className="text-sky-100 text-sm">
                  {isEdit ? "Modifica los datos del usuario" : "Completa los datos para crear el usuario"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nombre de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de usuario <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ingrese el nombre de usuario"
              />
            </div>
          </div>

          {/* Contraseña (solo en creación) */}
          {!isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    value={password}
                    onChange={e => setPass(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    value={confirmPassword}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
                )}
              </div>
            </>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rol <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🛡️</span>
              <select
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none bg-white"
                value={rolId}
                onChange={e => setRolId(Number(e.target.value))}
              >
                <option value="">Seleccione un rol</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
            </div>
          </div>

          {/* Selector de Empresa (solo para rol Empleador) */}
          {rolId === ROL_EMPLEADOR && (
            <div className="animate-in slide-in-from-top duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Empresa asociada <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏢</span>
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none bg-white"
                  value={empresaId || ""}
                  onChange={e => setEmpresaId(Number(e.target.value) || null)}
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? "Cargando empresas..." : "Seleccione una empresa"}
                  </option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.rnc ? `(${emp.rnc})` : ""}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                <span>ℹ️</span>
                El usuario podra ver los datos de esta empresa en su portal
              </p>
            </div>
          )}

          {/* Selector de Proveedor (solo para rol Backoffice) */}
          {rolId === ROL_BACKOFFICE && (
            <div className="animate-in slide-in-from-top duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Proveedor asociado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏪</span>
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none bg-white"
                  value={proveedorId || ""}
                  onChange={e => setProveedorId(Number(e.target.value) || null)}
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? "Cargando proveedores..." : "Seleccione un proveedor"}
                  </option>
                  {proveedores.map(prov => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre} {prov.rnc ? `(${prov.rnc})` : ""}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                <span>ℹ️</span>
                El usuario podra ver los datos de este proveedor en su portal
              </p>
            </div>
          )}

          {/* Estado Activo */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">{activo ? "✅" : "⛔"}</span>
              <div>
                <p className="font-medium text-gray-900">Estado del usuario</p>
                <p className="text-sm text-gray-500">
                  {activo ? "El usuario puede iniciar sesion" : "El usuario no puede iniciar sesion"}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Mensaje de error */}
          {err && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-in shake duration-200">
              <span>⚠️</span>
              <p>{err}</p>
            </div>
          )}

          {/* Info del rol seleccionado */}
          {rolId && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
              <p className="text-sm text-sky-800">
                <span className="font-medium">Rol seleccionado:</span> {getRolNombre(rolId)}
              </p>
              {rolId === ROL_EMPLEADOR && (
                <p className="text-xs text-sky-600 mt-1">
                  Este usuario tendra acceso al portal de empresa para ver empleados y consumos.
                </p>
              )}
              {rolId === ROL_BACKOFFICE && (
                <p className="text-xs text-sky-600 mt-1">
                  Este usuario tendra acceso al portal de proveedor para ver tiendas, cajeros y ventas.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl hover:from-sky-700 hover:to-sky-800 transition-all font-medium disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-sky-500/25"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <span>{isEdit ? "💾" : "✅"}</span>
                {isEdit ? "Guardar cambios" : "Crear usuario"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
