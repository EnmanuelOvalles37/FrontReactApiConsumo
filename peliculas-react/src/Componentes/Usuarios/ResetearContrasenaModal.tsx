import { useState } from "react";
import api from "../../Servicios/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: number;
  usuarioNombre: string;
  onSuccess?: () => void;
}

export default function ResetearContrasenaModal({ 
  isOpen, 
  onClose, 
  usuarioId, 
  usuarioNombre,
  onSuccess 
}: Props) {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const generarContrasena = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNuevaContrasena(password);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/usuarios-gestion/${usuarioId}/resetear-contrasena`, {
        nuevaContrasena
      });
      alert(`Contraseña reseteada para "${usuarioNombre}".\n\nNueva contraseña: ${nuevaContrasena}\n\nEl usuario deberá cambiarla en su próximo inicio de sesión.`);
      setNuevaContrasena("");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al resetear la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-900">🔑 Resetear Contraseña</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-amber-800 text-sm">
              ⚠️ Vas a resetear la contraseña del usuario <strong>"{usuarioNombre}"</strong>.
              El usuario deberá cambiarla en su próximo inicio de sesión.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={generarContrasena}
                className="px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm"
                title="Generar contraseña aleatoria"
              >
                🎲
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded"
            />
            Mostrar contraseña
          </label>

          {nuevaContrasena && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
              <p className="font-mono text-lg">{showPassword ? nuevaContrasena : "••••••••"}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !nuevaContrasena}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Reseteando..." : "Resetear Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}