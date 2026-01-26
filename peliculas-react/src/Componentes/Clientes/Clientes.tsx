import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../assets/api/http";

export interface Cliente {
  id: number;           // ← en DB es int
  nombre: string;
  grupo: string;
  saldo: number;
  diaCorte: number;
  saldoOriginal: number;
  activo: boolean;
  // opcionalmente: codigo?: string; empresaId?: number;
   empresaNombre?: string;
  empresaRnc?: string;
}

export default function Clientes() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [q, setQ] = useState("");
  const [onlyActivos, setOnlyActivos] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const canCreate = hasPermission("guardar_clientes");

  // ==== Carga desde la API ====
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {        
        const { data } = await api.get<Cliente[]>("/clientes");
        setClientes(data ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(e);
        const msg =
          e?.response?.status === 401
            ? "No autorizado (401). ¿Tienes el token activo?"
            : e?.response?.data?.message || "Error cargando clientes.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ==== Filtro local ====
  const filtered = useMemo(() => {
    let rows = clientes;
    if (q.trim()) {
      const t = q.toLowerCase();
      rows = rows.filter((r) => {
        const idStr = String(r.id);
        return (
          idStr.includes(t) ||
          r.nombre.toLowerCase().includes(t) ||
          r.grupo.toLowerCase().includes(t)
        );
      });
    }
    if (onlyActivos) rows = rows.filter((r) => r.activo);
    return rows;
  }, [clientes, q, onlyActivos]);

  // ==== Acciones ====
  const toggleSelect = (id: number) => {
  setSelected(prev => {
    const n = new Set(prev);
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    return n;
  });
};

  const clearSelection = () => setSelected(new Set());

  const bulkActivar = async (activo: boolean) => {
    if (selected.size === 0) return;
    const ids = new Set(selected);
    try {
      // await api.post("/clientes/activar", { ids: [...ids], activo })
      setClientes((prev) =>
        prev.map((c) => (ids.has(c.id) ? { ...c, activo } : c))
      );
      clearSelection();
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el estado.");
    }
  };

  const removeOne = async (id: number) => {
    try {
      // await api.delete(`/clientes/${id}`);
      setClientes((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  };

  const goNew = () => navigate("/clientes/nuevo");
  const goEdit = (id: number) => navigate(`/clientes/editar/${id}`);

  // ==== UI ====
  if (loading) {
    return (
      <main className="p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600 mt-3">Cargando clientes…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="bg-red-50 text-red-700 rounded-xl shadow p-4">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestiona a tus clientes y su estado</p>
        </div>
        {canCreate && (
          <button
            onClick={goNew}
            className="rounded-xl bg-sky-700 text-white px-4 py-2 font-medium hover:bg-sky-800"
          >
            + Nuevo cliente
          </button>
        )}
      </div>

      {/* Filtros / Acciones */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, código o grupo…"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={onlyActivos}
            onChange={(e) => setOnlyActivos(e.target.checked)}
          />
          Mostrar solo activos
        </label>

        {selected.size > 0 && (
          <div className="md:col-span-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">
              Seleccionados: {selected.size}
            </span>
            <button
              onClick={() => bulkActivar(true)}
              className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
            >
              Activar
            </button>
            <button
              onClick={() => bulkActivar(false)}
              className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
            >
              Desactivar
            </button>
            <button
              onClick={clearSelection}
              className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <article
            key={c.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="font-semibold text-gray-900">{c.nombre}</h3>

      {/* Empresa (si viene), si no, seguimos mostrando el grupo */}
      {c.empresaNombre ? (
        <p className="text-sm text-gray-600">
          Empresa: <span className="font-medium">{c.empresaNombre}</span>
          {c.empresaRnc ? <> — RNC: <span className="tabular-nums">{c.empresaRnc}</span></> : null}
        </p>
      ) : (
        <p className="text-sm text-gray-600">{c.grupo}</p>
      )}
    </div>

    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={selected.has(c.id)}
        onChange={() => toggleSelect(Number(c.id))}
      />
      Sel.
    </label>
  </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Saldo</p>
                <p className="font-semibold">RD$ {c.saldo.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Día corte</p>
                <p className="font-semibold">{c.diaCorte}</p>
              </div>
              <div>
                <p className="text-gray-500">Saldo original</p>
                <p className="font-semibold">
                  RD$ {c.saldoOriginal.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Estado</p>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    c.activo
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {c.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => goEdit(c.id)}
                className="rounded-lg px-3 py-1.5 border hover:bg-gray-50"
              >
                Editar
              </button>
              <button
                onClick={() => removeOne(c.id)}
                className="rounded-lg px-3 py-1.5 border text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl shadow p-10 mt-6 text-center text-gray-600">
          No se encontraron clientes.
        </div>
      )}
    </main>
  );
}
