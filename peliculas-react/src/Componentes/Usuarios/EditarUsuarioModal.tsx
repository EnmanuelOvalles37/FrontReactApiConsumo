import { useState, useEffect } from "react";
import api from "../../Servicios/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: number;
  nombreActual: string;
  onSuccess?: () => void;
}

export default function EditarUsuarioModal({ 
  isOpen, 
  onClose, 
  usuarioId, 
  nombreActual,
  onSuccess 
}: Props) {
  const [nombre, setNombre] = useState(nombreActual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNombre(nombreActual);
    setError("");
  }, [nombreActual, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (nombre.trim() === nombreActual) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      await api.patch(`/usuarios-gestion/${usuarioId}`, { nombre: nombre.trim() });
      alert("Usuario actualizado exitosamente");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al actualizar el usuario");
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
          <h3 className="text-lg font-semibold text-gray-900">✏️ Editar Usuario</h3>
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
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Nombre del usuario"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Este es el nombre con el que el usuario inicia sesión
            </p>
          </div>

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
              disabled={loading || !nombre.trim()}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}