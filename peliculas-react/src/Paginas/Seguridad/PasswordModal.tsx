// Componentes/ResetPasswordModal.tsx
import { useState } from "react";
import { usuariosApi } from "../../assets/api/usuarios";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: number | null;            // 👈 acepta null
};

export default function ResetPasswordModal({ open, onClose, userId }: Props) {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  // si no hay usuario o no está abierto, no renderiza
  if (!open || userId === null) return null;

  const save = async () => {
    if (pwd.trim().length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await usuariosApi.resetPassword(userId, pwd.trim());
      toast.success("Contraseña actualizada.");
      onClose();
      setPwd("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-semibold">Cambiar contraseña</h3>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Nueva contraseña"
          className="mt-3 w-full border rounded px-3 py-2"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="border rounded px-3 py-1.5">Cancelar</button>
          <button
            onClick={save}
            disabled={loading}
            className="bg-sky-700 text-white rounded px-3 py-1.5 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
