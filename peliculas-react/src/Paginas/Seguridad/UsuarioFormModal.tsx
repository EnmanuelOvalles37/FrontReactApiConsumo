import { useEffect, useState } from "react";
import { segApi } from "./seguridadApi";
import type { RolDto, SeguridadListDto } from "../../assets/types/seguridad";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  // si row existe => editar; si no, crear
  row?: SeguridadListDto | null;
};

export default function UsuarioFormModal({ open, onClose, onSaved, row }: Props) {
  const isEdit = !!row;
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [nombre, setNombre] = useState(row?.nombre ?? "");
  const [contrasena, setContrasena] = useState("");
  const [rolId, setRolId] = useState<number>(0);
  const [activo, setActivo] = useState<boolean>(row?.activo ?? true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rs = await segApi.listRoles();
        setRoles(rs);
        if (isEdit) {
          // mapear por nombre de rol -> id
          const found = rs.find(r => r.nombre.toLowerCase() === (row?.rol ?? "").toLowerCase());
          setRolId(found?.id ?? 0);
        } else {
          setRolId(rs[0]?.id ?? 0);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setErr("No se pudieron cargar los roles.");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (row) {
      setNombre(row.nombre);
      setActivo(row.activo);
    } else {
      setNombre("");
      setActivo(true);
    }
    setContrasena("");
  }, [row, open]);

  if (!open) return null;

  const guardar = async () => {
    try {
      setLoading(true);
      setErr(null);

      if (!nombre.trim()) { setErr("Nombre requerido."); return; }
      if (!isEdit && !contrasena.trim()) { setErr("Contraseña requerida."); return; }
      if (!rolId) { setErr("Debe seleccionar un rol."); return; }

      if (isEdit && row) {
        await segApi.updateUsuario(row.id, { nombre: nombre.trim(), rolId, activo });
      } else {
        await segApi.createUsuario({ nombre: nombre.trim(), contrasena: contrasena.trim(), rolId, activo });
      }

      onSaved();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "Error guardando el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h3>

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
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
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
            <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
            Activo
          </label>

          {err && <div className="rounded-lg bg-red-50 text-red-700 p-2 text-sm">{String(err)}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 border">Cancelar</button>
          <button
            onClick={guardar}
            disabled={loading}
            className="rounded-lg px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
