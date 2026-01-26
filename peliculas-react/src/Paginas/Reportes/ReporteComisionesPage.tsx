/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import api from '../../Servicios/api';


interface ReporteData {
  periodo: {
    desde: string;
    hasta: string;
  };
  totales: {
    totalConsumos: number;
    montoBruto: number;
    montoComision: number;
    montoNeto: number;
  };
  porProveedor: {
    proveedorId: number;
    proveedorNombre: string;
    consumos: number;
    montoBruto: number;
    montoComision: number;
    montoNeto: number;
    porcentajePromedio: number;
  }[];
  porDia: {
    fecha: string;
    consumos: number;
    montoBruto: number;
    montoComision: number;
  }[];
}

const ReporteComisionesPage: React.FC = () => {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [desde, setDesde] = useState(() => {
    const date = new Date();
    date.setDate(1); // Primer día del mes
    return date.toISOString().split('T')[0];
  });
  const [hasta, setHasta] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [proveedores, setProveedores] = useState<{id: number; nombre: string}[]>([]);

  useEffect(() => {
    loadProveedores();
    loadReporte();
  }, []);

  const loadProveedores = async () => {
    try {
      const response = await api.get('/proveedores');
      setProveedores(response.data.data || response.data);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
    }
  };

  const loadReporte = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/pagos-proveedor/reporte-comisiones?desde=${desde}&hasta=${hasta}`;
      if (proveedorId) {
        url += `&proveedorId=${proveedorId}`;
      }
      
      const response = await api.get(url);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    loadReporte();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Comisiones</h1>

      {/* ============================================================ */}
      {/* FILTROS */}
      {/* ============================================================ */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleFiltrar} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select
              value={proveedorId || ''}
              onChange={(e) => setProveedorId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Filtrar'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* ============================================================ */}
          {/* RESUMEN TOTAL */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500">Total Consumos</p>
              <p className="text-2xl font-bold text-gray-800">{data.totales.totalConsumos}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500">Monto Bruto</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.totales.montoBruto)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm text-green-100">Comisiones Ganadas</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totales.montoComision)}</p>
              <p className="text-xs text-green-100 mt-1">
                {data.totales.montoBruto > 0 
                  ? `${(data.totales.montoComision / data.totales.montoBruto * 100).toFixed(1)}% promedio`
                  : '0%'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500">Neto a Proveedores</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.totales.montoNeto)}</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* POR PROVEEDOR */}
          {/* ============================================================ */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Comisiones por Proveedor</h2>
            
            {data.porProveedor.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Proveedor</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Consumos</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Bruto</th>
                      <th className="text-right py-3 px-4 font-medium text-green-600">Comisión</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">% Prom</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.porProveedor.map((prov) => (
                      <tr key={prov.proveedorId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{prov.proveedorNombre}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{prov.consumos}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(prov.montoBruto)}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {formatCurrency(prov.montoComision)}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {prov.porcentajePromedio.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-800">
                          {formatCurrency(prov.montoNeto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-3 px-4 text-gray-700">TOTALES</td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {data.porProveedor.reduce((sum, p) => sum + p.consumos, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(data.totales.montoBruto)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {formatCurrency(data.totales.montoComision)}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {data.totales.montoBruto > 0 
                          ? `${(data.totales.montoComision / data.totales.montoBruto * 100).toFixed(1)}%`
                          : '0%'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(data.totales.montoNeto)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos para mostrar</p>
            )}
          </div>

          {/* ============================================================ */}
          {/* POR DÍA */}
          {/* ============================================================ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Comisiones por Día</h2>
            
            {data.porDia.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Consumos</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Bruto</th>
                      <th className="text-right py-3 px-4 font-medium text-green-600">Comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.porDia.map((dia, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{formatDate(dia.fecha)}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{dia.consumos}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(dia.montoBruto)}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {formatCurrency(dia.montoComision)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-3 px-4 text-gray-700">TOTAL</td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {data.porDia.reduce((sum, d) => sum + d.consumos, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(data.porDia.reduce((sum, d) => sum + d.montoBruto, 0))}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {formatCurrency(data.porDia.reduce((sum, d) => sum + d.montoComision, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos para mostrar</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteComisionesPage;