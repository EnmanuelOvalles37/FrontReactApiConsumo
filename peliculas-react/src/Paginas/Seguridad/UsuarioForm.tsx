
// pages/UsuarioForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usuariosApi  from "../../assets/api/usuarios";
import { error, success } from "../../utilidades/toast";

type Rol = { id:number; nombre:string };

export default function UsuarioForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();

  const [roles, setRoles] = useState<Rol[]>([]);
  const [nombre, setNombre] = useState("");
  const [rolId, setRolId] = useState<number | undefined>();
  const [activo, setActivo] = useState(true);

  // solo al crear
  const [contrasena, setContrasena] = useState("");

  // solo al editar (cambiar contraseña)
  const [nuevaPass, setNuevaPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await usuariosApi.listRoles();
        const rs = r ?? [];
        if (!mounted) return;
        setRoles(rs as Rol[]);
        if (!editing) setRolId(rs[0]?.id);

        if (editing) {
          const res = await usuariosApi.getUsuario(Number(id));
          const u = res;
          if (!mounted) return;
          setNombre(u.nombre);
          setRolId(u.rolId);
          setActivo(u.activo);
        }
      } catch {
        setErr("No se pudieron cargar los datos.");
      }
    })();
    return () => { mounted = false; };
  }, [editing, id]);

  const save = async () => {
    try {
      setLoading(true);
      setErr(null);

      //if (!nombre.trim() || !rolId) return setErr("Complete usuario y rol.");
      //if (!editing && !contrasena.trim()) return setErr("Ingrese una contraseña.");

      if (!nombre.trim() || !rolId) return error("Nombre requerido");
      if (!editing && contrasena.trim().length < 6) return error("La contraseña debe tener al menos 6 caracteres.");
      success(editing ? "Usuario actualizado" : "Usuario creado");

      if (editing) {
        await usuariosApi.updateUsuario(Number(id), { nombre: nombre.trim(), rolId, activo });
        if (nuevaPass.trim()) {
          await usuariosApi.resetPassword(Number(id), nuevaPass.trim());
        }
      } else {
        await usuariosApi.createUsuario({ nombre: nombre.trim(), contrasena: contrasena.trim(), rolId, activo });
      }
      nav("/usuarios");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(error(e?.response?.data?.error ?? "No se pudo guardar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-xl">
      <h1 className="text-xl font-semibold">{editing ? "Editar usuario" : "Nuevo usuario"}</h1>

      <label className="block text-sm">
        <span>Nombre de usuario</span>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="mt-1 border p-2 rounded w-full"
        />
      </label>

      {!editing && (
        <label className="block text-sm">
          <span>Contraseña</span>
          <input
            type="password"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            className="mt-1 border p-2 rounded w-full"
            placeholder="••••••••"
          />
        </label>
      )}

      <label className="block text-sm">
        <span>Rol</span>
        <select
          className="mt-1 border p-2 rounded w-full"
          value={rolId ?? ""}
          onChange={e => setRolId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Seleccione...</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
      </label>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
        Activo
      </label>

      {editing && (
        <div className="pt-2 border-t">
          <label className="block text-sm">
            <span>Nueva contraseña (opcional)</span>
            <input
              type="password"
              value={nuevaPass}
              onChange={e => setNuevaPass(e.target.value)}
              className="mt-1 border p-2 rounded w-full"
              placeholder="Dejar en blanco para no cambiar"
            />
          </label>
        </div>
      )}

      {err && <div className="rounded bg-red-50 text-red-700 p-2 text-sm">{err}</div>}

      <div className="flex gap-2">
        <button onClick={save} disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button onClick={() => nav(-1)} className="border px-4 py-2 rounded">Cancelar</button>
      </div>
    </div>
  );
}
