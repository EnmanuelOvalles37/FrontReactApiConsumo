/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../Servicios/api';


interface ProveedorFormData {
  nombre: string;
  rnc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  activo: boolean;
  // Configuración de pagos
  diasCorte: number | null;
  porcentajeComision: number;
}

const ProveedorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre: '',
    rnc: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    activo: true,
    diasCorte: null,
    porcentajeComision: 0,
  });

  // Cargar proveedor si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadProveedor(parseInt(id));
    }
  }, [id, isEditing]);

  const loadProveedor = async (proveedorId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/proveedores/${proveedorId}`);
      const data = response.data;
      setFormData({
        nombre: data.nombre || '',
        rnc: data.rnc || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        contacto: data.contacto || '',
        activo: data.activo ?? true,
        diasCorte: data.diasCorte || null,
        porcentajeComision: data.porcentajeComision || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'diasCorte') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else if (name === 'porcentajeComision') {
      const numValue = parseFloat(value) || 0;
      // Validar que esté entre 0 y 100
      if (numValue >= 0 && numValue <= 100) {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        await api.put(`/proveedores/${id}`, formData);
      } else {
        await api.post('/proveedores', formData);
      }
      navigate('/proveedores');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el proveedor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ============================================================ */}
          {/* INFORMACIÓN GENERAL */}
          {/* ============================================================ */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Información General
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del proveedor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RNC
                </label>
                <input
                  type="text"
                  name="rnc"
                  value={formData.rnc}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000-00000-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="809-000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contacto@proveedor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del contacto"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CONFIGURACIÓN DE PAGOS */}
          {/* ============================================================ */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Configuración de Pagos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de Corte
                </label>
                <input
                  type="number"
                  name="diasCorte"
                  value={formData.diasCorte || ''}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Día del mes (1-31)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Día del mes para generar el corte de consumos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="porcentajeComision"
                    value={formData.porcentajeComision}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Porcentaje de comisión/margen sobre cada consumo
                </p>
              </div>
            </div>

            {/* Nota informativa sobre comisión */}
            {formData.porcentajeComision > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Ejemplo de cálculo con {formData.porcentajeComision}% de comisión:
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Consumo de RD$1,000.00</li>
                      <li>• Tu comisión: RD${(1000 * formData.porcentajeComision / 100).toFixed(2)}</li>
                      <li>• Pago al proveedor: RD${(1000 - (1000 * formData.porcentajeComision / 100)).toFixed(2)}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* ESTADO */}
          {/* ============================================================ */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Proveedor activo
            </label>
          </div>

          {/* ============================================================ */}
          {/* BOTONES */}
          {/* ============================================================ */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/proveedores')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                isEditing ? 'Guardar Cambios' : 'Crear Proveedor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProveedorForm;