import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import axios from "axios";
import type { EmpresaDto } from "../../assets/api/empresa";
import api from "../../Servicios/api";

//type EmpresaLite = { id: number; nombre: string };

type FormData = {
  id?: string;
  nombre: string;
  grupo: string;
  empresaId: number | null;
  diaCorte: number;
  saldoOriginal: number;
  activo: boolean;
};

export default function ClienteForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  
  const [empresas, setEmpresas] = useState<EmpresaDto[]>([]);
  const [form, setForm] = useState<FormData>({
    nombre: "",
    grupo: "",
    empresaId: null,
    diaCorte: 15,
    saldoOriginal: 0,
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Carga combos + (si aplica) datos del cliente
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // TODO: usa tu endpoint real
         const { data } = await api.get<EmpresaDto[]>("/api/empresas");
         setEmpresas(data);
        //setEmpresas([
          //{ id: 1, nombre: "Empresa A" },
          //{ id: 2, nombre: "Empresa B" },
          //{ id: 3, nombre: "Empresa C" },
        //]);

        if (isEdit) {
          // TODO: usa tu endpoint real
           const { data } = await api.get<FormData>(`/api/clientes/${id}`);
           setForm(data);
          /*setForm({
            id,
            nombre: "Cliente demo",
            grupo: "Empresa A",
            empresaId: 1,
            diaCorte: 15,
            saldoOriginal: 1200,
            activo: true,
          });*/
        }
      } catch (e) {
        console.error(e);
        setErr("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const canSubmit = useMemo(() => {
    return form.nombre.trim().length >= 3 && form.diaCorte >= 1 && form.diaCorte <= 31;
  }, [form]);

  const onChange = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!canSubmit) {
      setErr("Revisa los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const payload: FormData = { ...form };

      if (isEdit) {
         await api.put(`/api/clientes/${form.id}`, payload);
      } else {
         await api.post("/api/clientes", payload);
      }

      navigate("/clientes");
    } catch (e) {
      console.error(e);
      setErr("No se pudo guardar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Editar cliente" : "Nuevo cliente"}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 grid gap-4 md:grid-cols-2">
        {err && (
          <div className="md:col-span-2 rounded-lg bg-red-50 text-red-700 p-2 text-sm">
            {err}
          </div>
        )}

        <label className="text-sm">
          Nombre completo
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.nombre}
            onChange={e => onChange("nombre", e.target.value)}
            placeholder="Ej: ACME - Juan Pérez"
            required
          />
        </label>

        

        <label className="text-sm">
          Empresa (selector)
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.empresaId ?? ""}
            onChange={e => onChange("empresaId", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— Sin empresa —</option>
            {empresas.map(x => (
              <option key={x.id} value={x.id}>
                {x.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          Día de corte
          <input
            type="number"
            min={1}
            max={31}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.diaCorte}
            onChange={e => onChange("diaCorte", Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          Limite de Credito (RD$)
          <input
            type="number"
            step="0.01"
            min={0}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.saldoOriginal}
            onChange={e => onChange("saldoOriginal", Number(e.target.value))}
          />
        </label>

        <div className="text-sm flex items-center gap-2">
          <input
            id="activo"
            type="checkbox"
            checked={form.activo}
            onChange={e => onChange("activo", e.target.checked)}
          />
          <label htmlFor="activo">Activo</label>
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/clientes")}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="rounded-lg bg-sky-700 text-white px-4 py-2 font-medium hover:bg-sky-800 disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </main>
  );
}
