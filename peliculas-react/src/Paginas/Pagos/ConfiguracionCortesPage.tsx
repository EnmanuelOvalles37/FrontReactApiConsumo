// src/Paginas/Pagos/ConfiguracionCortesPage.tsx
// Página para gestionar configuración de cortes automáticos por empresa

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

interface Configuracion {
  id: number;
  empresaId: number;
  empresaNombre: string;
  empresaRnc: string;
  diaCorte: number;
  diasGracia: number;
  corteAutomatico: boolean;
  creadoUtc: string;
  modificadoUtc?: string;
}

interface EmpresaSinConfig {
  id: number;
  nombre: string;
  rnc: string;
}

interface ProximoCorte {
  id: number;
  empresaId: number;
  empresaNombre: string;
  diaCorte: number;
  diasGracia: number;
  proximoCorte: string;
  diasRestantes: number;
}

export default function ConfiguracionCortesPage() {
  const navigate = useNavigate();

  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [empresasSinConfig, setEmpresasSinConfig] = useState<EmpresaSinConfig[]>([]);
  const [proximosCortes, setProximosCortes] = useState<ProximoCorte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMasivoOpen, setModalMasivoOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuracion | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    empresaId: 0,
    diaCorte: 1,
    diasGracia: 5,
    corteAutomatico: true
  });

  const [formMasivo, setFormMasivo] = useState({
    empresaIds: [] as number[],
    diaCorte: 1,
    diasGracia: 5,
    corteAutomatico: true
  });

  const [resumen, setResumen] = useState({
    totalConfiguradas: 0,
    conCorteAutomatico: 0,
    sinConfigurar: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    try {
      const [configRes, proximosRes] = await Promise.all([
        api.get("/configuracion-cortes"),
        api.get("/configuracion-cortes/proximos")
      ]);

      setConfiguraciones(configRes.data.configuraciones);
      setEmpresasSinConfig(configRes.data.empresasSinConfiguracion);
      setResumen(configRes.data.resumen);
      setProximosCortes(proximosRes.data.proximos_cortes);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (config?: Configuracion) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        empresaId: config.empresaId,
        diaCorte: config.diaCorte,
        diasGracia: config.diasGracia,
        corteAutomatico: config.corteAutomatico
      });
    } else {
      setEditingConfig(null);
      setFormData({
        empresaId: empresasSinConfig[0]?.id || 0,
        diaCorte: 1,
        diasGracia: 5,
        corteAutomatico: true
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingConfig(null);
  };

  const handleSave = async () => {
    try {
      await api.post("/configuracion-cortes", formData);
      setSuccess(editingConfig ? "Configuración actualizada exitosamente" : "Configuración creada exitosamente");
      handleCloseModal();
      cargarDatos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al guardar");
    }
  };

  const handleToggleAutomatico = async (id: number) => {
    try {
      const res = await api.patch(`/configuracion-cortes/${id}/toggle-automatico`);
      setSuccess(res.data.mensaje);
      cargarDatos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al cambiar estado");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta configuración? La empresa usará valores por defecto.")) return;
    try {
      await api.delete(`/configuracion-cortes/${id}`);
      setSuccess("Configuración eliminada");
      cargarDatos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al eliminar");
    }
  };

  const handleSaveMasivo = async () => {
    try {
      const res = await api.post("/configuracion-cortes/masivo", formMasivo);
      setSuccess(res.data.mensaje);
      setModalMasivoOpen(false);
      setFormMasivo({ empresaIds: [], diaCorte: 1, diasGracia: 5, corteAutomatico: true });
      cargarDatos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al guardar");
    }
  };

  const toggleEmpresaMasivo = (empresaId: number) => {
    setFormMasivo(prev => ({
      ...prev,
      empresaIds: prev.empresaIds.includes(empresaId)
        ? prev.empresaIds.filter(id => id !== empresaId)
        : [...prev.empresaIds, empresaId]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Volver
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">⏰ Configuración de Cortes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configura el día de corte automático para cada empresa
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarDatos}
              className="px-4 py-2 rounded-xl border hover:bg-gray-50"
            >
              🔄 Actualizar
            </button>
            {empresasSinConfig.length > 0 && (
              <button
                onClick={() => setModalMasivoOpen(true)}
                className="px-4 py-2 rounded-xl border border-sky-600 text-sky-600 hover:bg-sky-50"
              >
                Configurar Masivo
              </button>
            )}
            <button
              onClick={() => handleOpenModal()}
              disabled={empresasSinConfig.length === 0}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            >
              + Nueva Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
          {error}
          <button onClick={() => setError("")} className="ml-2 font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm">
          ✅ {success}
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-sm text-gray-500">Total Configuradas</p>
          <p className="text-3xl font-bold text-gray-900">{resumen.totalConfiguradas}</p>
        </div>
        <div className="bg-green-50 rounded-2xl shadow p-4">
          <p className="text-sm text-green-600">Con Corte Automático</p>
          <p className="text-3xl font-bold text-green-700">{resumen.conCorteAutomatico}</p>
        </div>
        <div className={`rounded-2xl shadow p-4 ${resumen.sinConfigurar > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${resumen.sinConfigurar > 0 ? 'text-amber-600' : 'text-gray-500'}`}>Sin Configurar</p>
          <p className={`text-3xl font-bold ${resumen.sinConfigurar > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{resumen.sinConfigurar}</p>
        </div>
      </div>

      {/* Próximos Cortes */}
      {proximosCortes.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">📅 Próximos Cortes Programados</h2>
          <div className="flex flex-wrap gap-2">
            {proximosCortes.slice(0, 6).map(pc => (
              <span
                key={pc.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  pc.diasRestantes === 0
                    ? 'bg-red-100 text-red-700'
                    : pc.diasRestantes <= 3
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                🏢 {pc.empresaNombre} - Día {pc.diaCorte} 
                ({pc.diasRestantes === 0 ? 'HOY' : `en ${pc.diasRestantes} días`})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Configuraciones */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Empresa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">RNC</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Día de Corte</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Días de Gracia</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Automático</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {configuraciones.map(config => (
              <tr key={config.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-600">🏢</span>
                    <span className="font-medium text-gray-900">{config.empresaNombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{config.empresaRnc}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-lg text-sm">
                    Día {config.diaCorte}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{config.diasGracia} días</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleAutomatico(config.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      config.corteAutomatico
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {config.corteAutomatico ? '✓ Activo' : '○ Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleOpenModal(config)}
                    className="text-sky-600 hover:text-sky-800 mr-2"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {configuraciones.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay configuraciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Empresas sin configurar */}
      {empresasSinConfig.length > 0 && (
        <div className="mt-6 bg-amber-50 rounded-2xl p-4">
          <h2 className="font-semibold text-amber-800 mb-2">⚠️ Empresas sin Configuración</h2>
          <p className="text-sm text-amber-700 mb-3">
            Estas empresas usarán valores por defecto (día 1, 5 días de gracia, sin corte automático)
          </p>
          <div className="flex flex-wrap gap-2">
            {empresasSinConfig.map(emp => (
              <button
                key={emp.id}
                onClick={() => {
                  setFormData({ ...formData, empresaId: emp.id });
                  setModalOpen(true);
                }}
                className="px-3 py-1 bg-white border border-amber-300 rounded-full text-sm text-amber-700 hover:bg-amber-100"
              >
                {emp.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingConfig ? 'Editar Configuración' : 'Nueva Configuración de Corte'}
              </h2>

              <div className="space-y-4">
                {/* Empresa */}
                {!editingConfig ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa *
                    </label>
                    <select
                      value={formData.empresaId}
                      onChange={(e) => setFormData({ ...formData, empresaId: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value={0}>Seleccione una empresa</option>
                      {empresasSinConfig.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre} - {emp.rnc}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <input
                      type="text"
                      value={editingConfig.empresaNombre}
                      disabled
                      className="w-full px-4 py-2 border rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                )}

                {/* Día de Corte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de Corte *
                  </label>
                  <select
                    value={formData.diaCorte}
                    onChange={(e) => setFormData({ ...formData, diaCorte: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(dia => (
                      <option key={dia} value={dia}>Día {dia} de cada mes</option>
                    ))}
                  </select>
                </div>

                {/* Días de Gracia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días de Gracia
                  </label>
                  <input
                    type="number"
                    value={formData.diasGracia}
                    onChange={(e) => setFormData({ ...formData, diasGracia: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={30}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Días adicionales antes de considerar vencido el documento
                  </p>
                </div>

                {/* Corte Automático */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, corteAutomatico: !formData.corteAutomatico })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.corteAutomatico ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.corteAutomatico ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700">
                    {formData.corteAutomatico ? 'Corte automático habilitado' : 'Corte automático deshabilitado'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  <p className="font-medium">ℹ️ Información</p>
                  <p className="mt-1">
                    Si el corte automático está habilitado, el sistema generará el corte
                    automáticamente el día configurado de cada mes.
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editingConfig && !formData.empresaId}
                  className="px-6 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Masivo */}
      {modalMasivoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Configuración Masiva
              </h2>

              <div className="space-y-4">
                {/* Selección de empresas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Empresas ({formMasivo.empresaIds.length} seleccionadas)
                  </label>
                  <div className="border rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                    {empresasSinConfig.map(emp => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formMasivo.empresaIds.includes(emp.id)}
                          onChange={() => toggleEmpresaMasivo(emp.id)}
                          className="w-4 h-4 text-sky-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{emp.nombre}</span>
                        <span className="text-xs text-gray-400">({emp.rnc})</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormMasivo({ ...formMasivo, empresaIds: empresasSinConfig.map(e => e.id) })}
                      className="text-xs text-sky-600 hover:underline"
                    >
                      Seleccionar todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMasivo({ ...formMasivo, empresaIds: [] })}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Deseleccionar todas
                    </button>
                  </div>
                </div>

                {/* Día de Corte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de Corte
                  </label>
                  <select
                    value={formMasivo.diaCorte}
                    onChange={(e) => setFormMasivo({ ...formMasivo, diaCorte: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(dia => (
                      <option key={dia} value={dia}>Día {dia}</option>
                    ))}
                  </select>
                </div>

                {/* Días de Gracia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días de Gracia
                  </label>
                  <input
                    type="number"
                    value={formMasivo.diasGracia}
                    onChange={(e) => setFormMasivo({ ...formMasivo, diasGracia: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={30}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Corte Automático */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormMasivo({ ...formMasivo, corteAutomatico: !formMasivo.corteAutomatico })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formMasivo.corteAutomatico ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formMasivo.corteAutomatico ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700">
                    Habilitar corte automático
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setModalMasivoOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveMasivo}
                  disabled={formMasivo.empresaIds.length === 0}
                  className="px-6 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  Aplicar a {formMasivo.empresaIds.length} empresas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}