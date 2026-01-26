/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Auth/CambiarContrasenaPage.tsx
// Página de cambio de contraseña obligatorio (primer login)

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "../Servicios/api";

export default function CambiarContrasenaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const primerLogin = location.state?.primerLogin || false;

  const [formData, setFormData] = useState({
    contrasenaActual: "",
    nuevaContrasena: "",
    confirmarContrasena: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError("");
  };

  const validarContrasena = (): string | null => {
    if (formData.nuevaContrasena.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      return "Las contraseñas no coinciden";
    }
    if (formData.nuevaContrasena === "123456") {
      return "Debe elegir una contraseña diferente a la inicial";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorValidacion = validarContrasena();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/cambiar-contrasena", {
        contrasenaActual: primerLogin ? "123456" : formData.contrasenaActual,
        nuevaContrasena: formData.nuevaContrasena,
        confirmarContrasena: formData.confirmarContrasena
      });

      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/mi-cuenta", { replace: true });
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Contraseña Actualizada!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu contraseña ha sido cambiada exitosamente.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo a tu cuenta...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {primerLogin ? "Crear Nueva Contraseña" : "Cambiar Contraseña"}
          </h1>
          {primerLogin && (
            <p className="text-gray-600 mt-2">
              Por seguridad, debes cambiar tu contraseña inicial
            </p>
          )}
        </div>

        {/* Info del usuario */}
        {currentUser && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Usuario:</p>
            <p className="font-semibold text-gray-900">{currentUser.usuario}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contraseña actual (solo si no es primer login) */}
          {!primerLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                name="contrasenaActual"
                value={formData.contrasenaActual}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={!primerLogin}
              />
            </div>
          )}

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="nuevaContrasena"
              value={formData.nuevaContrasena}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                "Cambiar Contraseña"
              )}
            </button>

            {!primerLogin && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        </form>

        {/* Tips de seguridad */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Use una combinación de letras, números y símbolos
          </p>
        </div>
      </div>
    </div>
  );
}