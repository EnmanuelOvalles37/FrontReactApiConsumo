import { useState } from "react";
import { createEmpresa } from "../../assets/api/empresa";
import { useNavigate } from "react-router-dom";

export default function EmpresaNew() {
  const [rnc, setRnc] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [limiteCredito, setLimiteCredito] = useState("");
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rnc.trim() || !nombre.trim()) return;
    setSaving(true);
    try {
      const emp = await createEmpresa({ rnc: rnc.trim(), nombre: nombre.trim() });
      nav(`/empresas/${emp.id}`);
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Nueva Empresa</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm mb-1">RNC</label>
          <input value={rnc} onChange={e => setRnc(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
        </div>
         <div>
          <label className="block text-sm mb-1">Telefono</label>
          <input value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Direccion</label>
          <input value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Limire de Credito</label>
          <input value={limiteCredito} onChange={e => setLimiteCredito(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
        </div>        
        
        <div className="flex gap-2">
          <button disabled={saving} className="px-4 py-2 rounded-xl shadow bg-black text-white disabled:opacity-50">
            Guardar
          </button>
          <button type="button" onClick={() => nav(-1)} className="px-4 py-2 rounded-xl border">Cancelar</button>
        </div>
      </form>
    </div>
  );
}



