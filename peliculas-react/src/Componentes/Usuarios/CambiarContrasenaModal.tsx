import { useState } from "react";
import api from "../../Servicios/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CambiarContrasenaModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    contrasenaActual: "",
    contrasenaNueva: "",
    confirmarContrasena: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!form.contrasenaActual) {
      setError("Ingresa tu contraseña actual");
      return;
    }

    if (form.contrasenaNueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.contrasenaNueva !== form.confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await api.post("/usuarios-gestion/cambiar-contrasena", form);
      alert("Contraseña actualizada exitosamente");
      setForm({ contrasenaActual: "", contrasenaNueva: "", confirmarContrasena: "" });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">🔐 Cambiar Contraseña</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="contrasenaActual"
              value={form.contrasenaActual}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Tu contraseña actual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="contrasenaNueva"
              value={form.contrasenaNueva}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="confirmarContrasena"
              value={form.confirmarContrasena}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="rounded"
            />
            Mostrar contraseñas
          </label>

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
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}