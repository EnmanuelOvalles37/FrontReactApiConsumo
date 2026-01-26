import { useEffect, useMemo, useState } from "react";
import { segApi } from "./seguridadApi";
import type { SeguridadListDto } from "../../assets/types/seguridad";
import UsuarioFormModal from "./UsuarioFormModal";
import { useAuth } from "../../Context/AuthContext";
//import { getRoles, updateUsuarioRol } from "../../api/seguridad";

export default function UsuariosPage() {
  const { hasPermission } = useAuth();
  const [rows, setRows] = useState<SeguridadListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<SeguridadListDto | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canAdmin = hasPermission("admin_usuarios");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await segApi.listUsuarios();
      setRows(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      r.nombre.toLowerCase().includes(s) ||
      r.rol.toLowerCase().includes(s)
    );
  }, [q, rows]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestiona usuarios, roles y estado</p>
        </div>
        {canAdmin && (
          <button
            onClick={() => { setEditRow(null); setOpen(true); }}
            className="rounded-xl bg-sky-700 px-4 py-2 text-white font-medium hover:bg-sky-800"
          >
            + Nuevo usuario
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex gap-3">
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Buscar por usuario o rol..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button onClick={fetchData} className="rounded-lg border px-3 py-2">Refrescar</button>
        </div>
      </div>

      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Usuario </th>
              <th className="text-left px-4 py-2">Rol</th>
              <th className="text-center px-4 py-2">Activo</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-3" colSpan={4}>Cargando…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td className="px-4 py-3" colSpan={4}>Sin resultados</td></tr>}
            {!loading && filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.nombre}</td>
                <td className="px-4 py-2">{r.rol}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${r.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {r.activo ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {canAdmin && (
                    <div className="flex gap-2 justify-end">
                      <button
                        className="rounded-lg px-3 py-1.5 border hover:bg-gray-50"
                        onClick={() => { setEditRow(r); setOpen(true); }}
                      >
                        Editar
                      </button>
                      {/* Cambiar contraseña rápido: opción minimal */}
                      {/* O puedes abrir otro modal si prefieres */}
                      
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UsuarioFormModal
        open={open}
        row={editRow}
        onClose={() => setOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}
