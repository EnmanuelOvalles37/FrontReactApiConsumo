// Componentes/EmpresaModal.tsx
import { useEffect, useState } from "react";
import { empresasApi } from "../../assets/api/ClientesApi";
import { validateEmail, validatePhone, maskAndValidateRNC } from "../../utilidades/validadores";



type Empresa = { 
                 id: number;
                 nombre: string;
                 rnc?: string;
                 limite_Credito: number;
                 activo: boolean;
                 telefono?: string;
                 email?: string;
                 direccion?: string; 
                };

type Props = {
  open: boolean;
  mode: "create" | "edit";
  empresa?: Empresa | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EmpresaModal({ open, mode, empresa, onClose, onSaved }: Props) {
  const isEdit = mode === "edit";
  const [nombre, setNombre] = useState("");
  const [rnc, setRnc] = useState("");
  const [limite, setLimite] = useState<number>(0);
  const [activo, setActivo] = useState(true);
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [rncError, setRncError] = useState<string | null>(null);
const [emailError, setEmailError] = useState<string | null>(null);
const [telError, setTelError] = useState<string | null>(null);


  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (isEdit && empresa) {
      setNombre(empresa.nombre);
      setRnc(empresa.rnc ?? "");
      setLimite(empresa.limite_Credito ?? 0);
      setActivo(empresa.activo ?? true);
      setTelefono(empresa.telefono ?? "");
      setEmail(empresa.email ?? "");
      setDireccion(empresa.direccion ?? "");
    } else {
       setNombre("");
       setRnc("");
       setLimite(0);
       setActivo(true);
       setTelefono("");
       setEmail("");
       setDireccion("");
    }
  }, [open, isEdit, empresa]);

  const save = async () => {
    try {
      setLoading(true);
      setErr(null);
      if (rnc && rncError) { setErr("RNC inválido."); return; }
      if (email && emailError) { setErr("Email inválido."); return; }
      if (telefono && telError) { setErr("Teléfono inválido."); return; }
      if (!nombre.trim()) { setErr("Nombre requerido"); return; }

      const payload = {
        nombre: nombre.trim(),
        rnc: rnc.trim() || undefined,
        limite_Credito: Number(limite) || 0,
        activo,
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
        direccion: direccion.trim() || undefined,
      };

      if (isEdit && empresa) await empresasApi.update(empresa.id, payload);
      else await empresasApi.create(payload); 

      onSaved();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "No se pudo guardar la empresa");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">{isEdit ? "Editar empresa" : "Nueva empresa"}</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm md:col-span-2">Nombre
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={nombre} onChange={e => setNombre(e.target.value)} />
          </label>

          <label className="text-sm">RNC
  <input
    className={`mt-1 w-full rounded-lg border px-3 py-2 ${rncError ? "border-red-500" : ""}`}
    value={rnc}
    onChange={(e) => {
      const { value, valid } = maskAndValidateRNC(e.target.value);
      setRnc(value);
      setRncError(!value || valid ? null : "Debe tener 9 dígitos (000-00000-0)");
    }}
    placeholder="000-00000-0"
  />
  {rncError && <p className="text-xs text-red-600 mt-1">{rncError}</p>}
</label>

          <label className="text-sm">Límite de crédito
            <input className="mt-1 w-full rounded-lg border px-3 py-2" type="number" step="0.01" value={limite} onChange={e => setLimite(Number(e.target.value))} />
          </label>
{/* Teléfono */}
<label className="text-sm">
  Teléfono
  <input
    className={`mt-1 w-full rounded-lg border px-3 py-2 ${telError ? "border-red-500" : ""}`}
    placeholder="809-555-1234"
    value={telefono}
    onChange={(e) => {
      const v = e.target.value;
      setTelefono(v);
      setTelError(validatePhone(v) ? null : "Formato inválido (809-555-1234)");
    }}
  />
  {telError && <p className="text-xs text-red-600 mt-1">{telError}</p>}
</label>

          {/* Email */}
<label className="text-sm">
  Email
  <input
    className={`mt-1 w-full rounded-lg border px-3 py-2 ${emailError ? "border-red-500" : ""}`}
    type="email"
    placeholder="facturacion@empresa.com"
    value={email}
    onChange={(e) => {
      const v = e.target.value;
      setEmail(v);
      setEmailError(validateEmail(v) ? null : "Email inválido");
    }}
  />
  {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
</label>

          <label className="text-sm md:col-span-2">Dirección
            <textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={2} value={direccion} onChange={e => setDireccion(e.target.value)} />
          </label>

          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
            Activa
          </label>

          {err && <div className="md:col-span-2 rounded-lg bg-red-50 text-red-700 p-2 text-sm">{err}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 border">Cancelar</button>
          <button onClick={save} disabled={loading} className="rounded-lg px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
