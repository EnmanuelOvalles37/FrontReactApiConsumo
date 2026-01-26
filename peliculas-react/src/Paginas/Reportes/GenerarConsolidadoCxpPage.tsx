/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// GenerarConsolidadoCxpPage.tsx - CON VISTA PREVIA DE COMISIÓN
// ============================================================
// Formulario para generar consolidado de consumos (CxP)
// Muestra vista previa con desglose de comisión antes de generar
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Servicios/api';


interface Proveedor {
  id: number;
  nombre: string;
  rnc?: string;
  porcentajeComision: number;
  diasCorte?: number;
}

interface VistaPrevia {
  cantidadConsumos: number;
  montoBruto: number;
  montoComision: number;
  montoNeto: number;
  consumos: {
    id: number;
    fecha: string;
    clienteNombre: string;
    monto: number;
    montoComision: number;
    montoNeto: number;
  }[];
}

const GenerarConsolidadoCxpPage: React.FC = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<VistaPrevia | null>(null);

  const [formData, setFormData] = useState({
    proveedorId: '',
    periodoDesde: '',
    periodoHasta: '',
    numeroFacturaProveedor: '',
    concepto: '',
    notas: '',
    diasParaPagar: 30
  });

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      const response = await api.get('/proveedores?activo=true');
      setProveedores(response.data.data || response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      setError('Error al cargar proveedores');
    }
  };

  const handleProveedorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFormData(prev => ({ ...prev, proveedorId: id }));
    setVistaPrevia(null);
    
    if (id) {
      const prov = proveedores.find(p => p.id === parseInt(id));
      setProveedorSeleccionado(prov || null);
    } else {
      setProveedorSeleccionado(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setVistaPrevia(null);
  };

  const loadVistaPrevia = async () => {
    if (!formData.proveedorId || !formData.periodoDesde || !formData.periodoHasta) {
      setError('Selecciona proveedor y período');
      return;
    }

    try {
      setLoadingPreview(true);
      setError(null);
      
      const response = await api.get('/pagos-proveedor/preview-consolidado', {
        params: {
          proveedorId: formData.proveedorId,
          periodoDesde: formData.periodoDesde,
          periodoHasta: formData.periodoHasta
        }
      });
      
      setVistaPrevia(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar vista previa');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proveedorId || !formData.periodoDesde || !formData.periodoHasta) {
      setError('Completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/pagos-proveedor/consolidar', {
        proveedorId: parseInt(formData.proveedorId),
        periodoDesde: formData.periodoDesde,
        periodoHasta: formData.periodoHasta,
        numeroFacturaProveedor: formData.numeroFacturaProveedor || null,
        concepto: formData.concepto || null,
        notas: formData.notas || null,
        diasParaPagar: formData.diasParaPagar
      });

      // Redirigir al documento creado
      navigate(`/pagos/cxp/documentos/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar consolidado');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(value);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Generar Consolidado CxP</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor *
              </label>
              <select
                name="proveedorId"
                value={formData.proveedorId}
                onChange={handleProveedorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - {p.porcentajeComision}% comisión
                  </option>
                ))}
              </select>
            </div>

            {/* Info del proveedor seleccionado */}
            {proveedorSeleccionado && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800 font-medium">{proveedorSeleccionado.nombre}</p>
                    {proveedorSeleccionado.rnc && (
                      <p className="text-xs text-blue-600">RNC: {proveedorSeleccionado.rnc}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-800">
                      {proveedorSeleccionado.porcentajeComision}%
                    </p>
                    <p className="text-xs text-blue-600">Comisión</p>
                  </div>
                </div>
              </div>
            )}

            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde *
                </label>
                <input
                  type="date"
                  name="periodoDesde"
                  value={formData.periodoDesde}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta *
                </label>
                <input
                  type="date"
                  name="periodoHasta"
                  value={formData.periodoHasta}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Botón Vista Previa */}
            <button
              type="button"
              onClick={loadVistaPrevia}
              disabled={loadingPreview || !formData.proveedorId || !formData.periodoDesde || !formData.periodoHasta}
              className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loadingPreview ? 'Cargando...' : 'Ver Vista Previa'}
            </button>

            {/* Campos adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Factura Proveedor
              </label>
              <input
                type="text"
                name="numeroFacturaProveedor"
                value={formData.numeroFacturaProveedor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días para Pagar
              </label>
              <input
                type="number"
                name="diasParaPagar"
                value={formData.diasParaPagar}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !vistaPrevia}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Generar Consolidado'}
              </button>
            </div>
          </form>
        </div>

        {/* Vista Previa */}
        <div className="space-y-6">
          {vistaPrevia ? (
            <>
              {/* Resumen */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vista Previa</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Consumos</span>
                    <span className="font-medium">{vistaPrevia.cantidadConsumos}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Monto Bruto</span>
                    <span className="font-medium">{formatCurrency(vistaPrevia.montoBruto)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b bg-green-50 -mx-6 px-6">
                    <span className="text-green-700">Tu Comisión ({proveedorSeleccionado?.porcentajeComision}%)</span>
                    <span className="font-medium text-green-700">-{formatCurrency(vistaPrevia.montoComision)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold text-gray-800">Total a Pagar</span>
                    <span className="font-bold text-xl text-gray-800">{formatCurrency(vistaPrevia.montoNeto)}</span>
                  </div>
                </div>
              </div>

              {/* Detalle de consumos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detalle ({vistaPrevia.consumos.length} consumos)
                </h3>
                
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">Fecha</th>
                        <th className="text-left py-2 font-medium text-gray-600">Cliente</th>
                        <th className="text-right py-2 font-medium text-gray-600">Bruto</th>
                        <th className="text-right py-2 font-medium text-green-600">Com.</th>
                        <th className="text-right py-2 font-medium text-gray-600">Neto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vistaPrevia.consumos.map((c) => (
                        <tr key={c.id} className="border-b border-gray-100">
                          <td className="py-2 text-gray-600 text-xs">{formatDateTime(c.fecha)}</td>
                          <td className="py-2 text-gray-800">{c.clienteNombre}</td>
                          <td className="py-2 text-right text-gray-600">{formatCurrency(c.monto)}</td>
                          <td className="py-2 text-right text-green-600">{formatCurrency(c.montoComision)}</td>
                          <td className="py-2 text-right font-medium">{formatCurrency(c.montoNeto)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Selecciona proveedor y período, luego haz clic en "Ver Vista Previa"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerarConsolidadoCxpPage;