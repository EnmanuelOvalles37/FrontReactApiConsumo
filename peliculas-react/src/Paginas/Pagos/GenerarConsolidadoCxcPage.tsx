/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/CxC/GenerarConsolidadoCxcPage.tsx
// Página para generar consolidado CxC a una empresa

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Servicios/api";


type Empresa = {
  empresaId: number;
  empresaNombre: string;
  diaCorte: number | null;
};

type ConsumoPreview = {
  id: number;
  fecha: string;
  empleadoNombre: string;
  empleadoCodigo: string;
  proveedorNombre: string;
  tiendaNombre: string;
  monto: number;
};

type PreviewData = {
  empresa: { id: number; nombre: string };
  periodoDesde: string;
  periodoHasta: string;
  cantidadConsumos: number;
  cantidadEmpleados: number;
  montoTotal: number;
  consumos: ConsumoPreview[];
};

export default function GenerarConsolidadoCxcPage() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [periodoDesde, setPeriodoDesde] = useState("");
  const [periodoHasta, setPeriodoHasta] = useState("");
  const [diasParaPagar, setDiasParaPagar] = useState(30);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEmpresas();
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setPeriodoHasta(hoy.toISOString().split('T')[0]);
    setPeriodoDesde(inicioMes.toISOString().split('T')[0]);
  }, []);

  const loadEmpresas = async () => {
    try {
      const res = await api.get("/cxc/empresas");
      setEmpresas(res.data.empresas || res.data || []);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    }
  };

  const loadPreview = async () => {
    if (!empresaId || !periodoDesde || !periodoHasta) {
      setError("Selecciona empresa y período");
      return;
    }

    try {
      setLoadingPreview(true);
      setError("");
      const res = await api.get(`/cxc/empresas/${empresaId}/preview-consolidado`, {
        params: { desde: periodoDesde, hasta: periodoHasta }
      });
      setPreview(res.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Error cargando preview");
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGenerar = async () => {
    if (!empresaId || !preview) return;

    try {
      setLoading(true);
      setError("");
      const res = await api.post(`/cxc/empresas/${empresaId}/consolidar`, {
        periodoDesde,
        periodoHasta,
        diasParaPagar
      });
      
      navigate(`/pagos/cxc/documentos/${res.data.id}`, {
        state: { mensaje: res.data.mensaje }
      });
    } catch (error: any) {
      setError(error.response?.data?.message || "Error generando consolidado");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/cxc" className="text-gray-400 hover:text-gray-600">CxC</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Generar Consolidado</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">📄 Generar Consolidado CxC</h1>
        <p className="text-gray-500 mt-1">Agrupa los consumos de empleados de una empresa en un documento</p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa *</label>
            <select
              value={empresaId || ""}
              onChange={(e) => { setEmpresaId(Number(e.target.value)); setPreview(null); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Seleccionar empresa...</option>
              {empresas.map((emp) => (
                <option key={emp.empresaId} value={emp.empresaId}>
                  {emp.empresaNombre} {emp.diaCorte ? `(Corte día ${emp.diaCorte})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Días para pagar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Días para pagar</label>
            <input
              type="number"
              value={diasParaPagar}
              onChange={(e) => setDiasParaPagar(Number(e.target.value))}
              min={1}
              max={90}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Período desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período desde *</label>
            <input
              type="date"
              value={periodoDesde}
              onChange={(e) => { setPeriodoDesde(e.target.value); setPreview(null); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Período hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período hasta *</label>
            <input
              type="date"
              value={periodoHasta}
              onChange={(e) => { setPeriodoHasta(e.target.value); setPreview(null); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Botón preview */}
        <button
          onClick={loadPreview}
          disabled={!empresaId || !periodoDesde || !periodoHasta || loadingPreview}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
        >
          {loadingPreview ? "Cargando..." : "🔍 Ver Preview de Consumos"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6">
            <h3 className="font-semibold text-sky-900 mb-4">📋 Resumen del Consolidado</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-semibold text-gray-900">{preview.empresa.nombre}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Consumos</p>
                <p className="text-2xl font-bold text-sky-600">{preview.cantidadConsumos}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Empleados</p>
                <p className="text-2xl font-bold text-sky-600">{preview.cantidadEmpleados}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-sky-600">{formatCurrency(preview.montoTotal)}</p>
              </div>
            </div>
          </div>

          {/* Lista de consumos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Consumos a incluir ({preview.consumos.length})</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Empleado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Proveedor/Tienda</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.consumos.slice(0, 50).map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(c.fecha)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{c.empleadoNombre}</span>
                        {c.empleadoCodigo && (
                          <span className="text-xs text-gray-500 ml-2">({c.empleadoCodigo})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {c.proveedorNombre}
                        {c.tiendaNombre && <span className="text-gray-400"> / {c.tiendaNombre}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(c.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.consumos.length > 50 && (
                <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                  Mostrando 50 de {preview.consumos.length} consumos
                </div>
              )}
            </div>
          </div>

          {/* Botón generar */}
          <button
            onClick={handleGenerar}
            disabled={loading}
            className="w-full py-4 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-semibold text-lg disabled:opacity-50"
          >
            {loading ? "Generando..." : `✅ Generar Consolidado por ${formatCurrency(preview.montoTotal)}`}
          </button>
        </div>
      )}
    </div>
  );
}