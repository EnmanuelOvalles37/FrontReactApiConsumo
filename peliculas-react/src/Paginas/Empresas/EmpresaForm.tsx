// src/Paginas/Empresas/EmpresaForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { empresasApi, type EmpresaForm } from "../../Servicios/empresasApi";
import { useAuth } from "../../Context/AuthContext";

export default function EmpresaForm(){
  const { hasPermission } = useAuth();
  

  const { id } = useParams(); // 'nueva' | number
  const isEdit = id && id !== "nueva";
  const nav = useNavigate();

  const [form,setForm]=useState<EmpresaForm>({
    rnc:"", nombre:"", telefono:"", email:"", direccion:"", activo:true
  });

  useEffect(()=>{ (async()=>{
    if(isEdit){
      const data = await empresasApi.get(Number(id));
      setForm(data);
    }
  })();},[id,isEdit]);

  if(!hasPermission("empresas_editar")) return <div className="p-4">No autorizado</div>;

  const save = async ()=>{
    if(isEdit) await empresasApi.update(Number(id), form);
    else await empresasApi.create(form);
    nav("/empresas");
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow p-5 grid gap-3">
        <h2 className="text-lg font-semibold">{isEdit? "Editar":"Nueva"} empresa</h2>

        <label className="text-sm">RNC
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.rnc} onChange={e=>setForm({...form, rnc:e.target.value})}/>
        </label>

        <label className="text-sm">Nombre
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}/>
        </label>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">Teléfono
            <input className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.telefono ?? ""} onChange={e=>setForm({...form, telefono:e.target.value})}/>
          </label>
          <label className="text-sm">Email
            <input className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.email ?? ""} onChange={e=>setForm({...form, email:e.target.value})}/>
          </label>
        </div>

        <label className="text-sm">Dirección
          <input className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.direccion ?? ""} onChange={e=>setForm({...form, direccion:e.target.value})}/>
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.activo} onChange={e=>setForm({...form, activo:e.target.checked})}/>
          Activa
        </label>

        <div className="flex justify-end gap-2">
          <button className="rounded-xl border px-4 py-2" onClick={()=>nav(-1)}>Cancelar</button>
          <button className="rounded-xl bg-sky-700 text-white px-4 py-2 hover:bg-sky-800" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
