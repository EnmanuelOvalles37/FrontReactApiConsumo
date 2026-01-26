import { useEffect, useState } from "react";
import { segApi } from "./seguridadApi";
import type { RolDto, RolPermisoCheckDto } from "../../assets/types/seguridad";
import { useAuth } from "../../Context/AuthContext";

export default function RolPermisosPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("admin_roles");

  const [roles, setRoles] = useState<RolDto[]>([]);
  const [rolId, setRolId] = useState<number>(0);
  const [items, setItems] = useState<RolPermisoCheckDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rs = await segApi.listRoles();
      setRoles(rs);
      setRolId(rs[0]?.id ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "Error cargando roles");
    } finally {
      setLoading(false);
    }
  };

  const loadPerms = async (id: number) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await segApi.listPermisosDeRol(id);
      setItems(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "Error cargando permisos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);
  useEffect(() => { if (rolId) loadPerms(rolId); }, [rolId]);

  const toggle = (id: number) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, asignado: !x.asignado } : x));
  };

  const guardar = async () => {
    try {
      setSaving(true);
      const ids = items.filter(x => x.asignado).map(x => x.id);
      await segApi.updatePermisosDeRol(rolId, ids);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "Error guardando permisos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Permisos por Rol</h1>
          <p className="text-gray-600">Asigna o quita permisos desde aquí</p>
        </div>
        {canEdit && (
          <button
            onClick={guardar}
            disabled={saving || !rolId}
            className="rounded-xl bg-sky-700 px-4 py-2 text-white font-medium hover:bg-sky-800 disabled:opacity-40"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
      </div>

      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>}

      <div className="bg-white rounded-xl shadow p-4">
        <div className="mb-3">
          <label className="text-sm">Rol</label>
          <select
            className="mt-1 w-full sm:w-64 rounded-lg border px-3 py-2"
            value={rolId}
            onChange={e => setRolId(Number(e.target.value))}
          >
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>

        {loading && <div className="p-3 text-sm text-gray-600">Cargando…</div>}
        {!loading && items.length === 0 && <div className="p-3 text-sm text-gray-600">Sin permisos</div>}

        {!loading && items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(p => (
              <label key={p.id} className="flex items-start gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={p.asignado}
                  onChange={() => toggle(p.id)}
                />
                <div>
                  <div className="font-medium">{p.nombre}</div>
                  <div className="text-xs text-gray-500">{p.codigo}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
