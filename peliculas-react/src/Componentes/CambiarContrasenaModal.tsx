// components/ResetPasswordModal.tsx
import { useState } from "react";
import { success, error } from "../utilidades/toast";
import segApi from "../assets/api/usuarios";

export default function ResetPasswordModal({ open, onClose, userId }:{ open:boolean; onClose:()=>void; userId:number }) {
  const [pwd, setPwd] = useState(""); const [loading, setLoading] = useState(false);
  if(!open) return null;
  const save = async ()=>{
    if (pwd.trim().length < 6) return error("Mínimo 6 caracteres");
    setLoading(true);
    try { await segApi.resetPassword(userId, pwd.trim()); success("Contraseña actualizada"); onClose(); }
    catch { error("No se pudo actualizar"); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
        <h3 className="font-semibold">Cambiar contraseña</h3>
        <input type="password" className="mt-3 w-full border rounded px-3 py-2" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Nueva contraseña" />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="border rounded px-3 py-1.5">Cancelar</button>
          <button onClick={save} disabled={loading} className="bg-sky-700 text-white rounded px-3 py-1.5 disabled:opacity-50">Guardar</button>
        </div>
      </div>
    </div>
  );
}
