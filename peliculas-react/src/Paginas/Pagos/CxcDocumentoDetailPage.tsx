/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/CxC/CxcDocumentoDetailPage.tsx
// Detalle de un documento CxC con consumos y pagos

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../Servicios/api";


type Detalle = {
  id: number;
  consumoId: number;
  fecha: string;
  empleadoNombre: string;
  empleadoCodigo: string;
  proveedorNombre: string;
  tiendaNombre: string;
  concepto: string;
  monto: number;
};

type Pago = {
  id: number;
  numeroComprobante: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre: string;
  referencia: string | null;
  registradoPor: string;
};

type Refinanciamiento = {
  id: number;
  montoRefinanciado: number;
  montoPagado: number;
  montoPendiente: number;
  fechaRefinanciamiento: string;
  fechaVencimiento: string;
  estado: number;
  estadoNombre: string;
};

type Documento = {
  id: number;
  numeroDocumento: string;
  empresa: { id: number; nombre: string; rnc: string };
  periodoDesde: string;
  periodoHasta: string;
  cantidadConsumos: number;
  cantidadEmpleados: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  estadoNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  detalles: Detalle[];
  pagos: Pago[];
  refinanciamiento: Refinanciamiento | null;
};

export default function CxcDocumentoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"consumos" | "pagos">("consumos");
  const [creandoRefinanciamiento, setCreandoRefinanciamiento] = useState(false);

  useEffect(() => {
    if (id) loadDocumento();
  }, [id]);

  const loadDocumento = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/cxc/documentos/${id}`);
      setDocumento(res.data);
    } catch (error) {
      console.error("Error cargando documento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearRefinanciamiento = async () => {
    if (!documento || !confirm("¿Crear refinanciamiento? Esto restablecerá el crédito de los empleados.")) return;

    try {
      setCreandoRefinanciamiento(true);
      const res = await api.post("/api/refinanciamientos", {
        cxcDocumentoId: documento.id
      });
      alert(res.data.mensaje);
      loadDocumento();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creando refinanciamiento");
    } finally {
      setCreandoRefinanciamiento(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");
  const formatDateTime = (date: string) => new Date(date).toLocaleString("es-DO");

  const getEstadoBadge = (estado: number) => {
    const styles: Record<number, string> = {
      0: "bg-sky-100 text-sky-700",
      1: "bg-amber-100 text-amber-700",
      2: "bg-green-100 text-green-700",
      3: "bg-purple-100 text-purple-700",
      4: "bg-gray-100 text-gray-700"
    };
    const labels: Record<number, string> = {
      0: "Pendiente",
      1: "Parcial",
      2: "Pagado",
      3: "Refinanciado",
      4: "Anulado"
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${styles[estado] || styles[0]}`}>
        {labels[estado] || "Desconocido"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700">Documento no encontrado</p>
        </div>
      </div>
    );
  }

  const porcentajePagado = documento.montoTotal > 0 
    ? (documento.montoPagado / documento.montoTotal * 100) 
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
            <span className="text-gray-300">/</span>
            <Link to="/pagos/cxc" className="text-gray-400 hover:text-gray-600">CxC</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{documento.numeroDocumento}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{documento.numeroDocumento}</h1>
            {getEstadoBadge(documento.estado)}
          </div>
        </div>
        {documento.estado !== 2 && documento.estado !== 4 && (
          <div className="flex gap-3">
            {documento.estado !== 3 && (
              <button
                onClick={handleCrearRefinanciamiento}
                disabled={creandoRefinanciamiento}
                className="px-4 py-2.5 border border-purple-300 text-purple-700 rounded-xl hover:bg-purple-50 transition-colors font-medium disabled:opacity-50"
              >
                🔄 Refinanciar
              </button>
            )}
            <button
              onClick={() => navigate(`/pagos/cxc/documentos/${id}/cobrar`)}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              💵 Registrar Cobro
            </button>
          </div>
        )}
      </div>

      {/* Info principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del documento */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📋 Información del Documento</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium text-gray-900">{documento.empresa.nombre}</p>
              {documento.empresa.rnc && (
                <p className="text-sm text-gray-500">RNC: {documento.empresa.rnc}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Período</p>
              <p className="font-medium text-gray-900">
                {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Emisión</p>
              <p className="font-medium text-gray-900">{formatDate(documento.fechaEmision)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Vencimiento</p>
              <p className="font-medium text-gray-900">{formatDate(documento.fechaVencimiento)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cantidad Consumos</p>
              <p className="font-medium text-gray-900">{documento.cantidadConsumos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Empleados</p>
              <p className="font-medium text-gray-900">{documento.cantidadEmpleados}</p>
            </div>
          </div>
        </div>

        {/* Resumen de montos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">💰 Resumen</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(documento.montoTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Pagado</span>
              <span className="text-lg font-semibold text-green-600">{formatCurrency(documento.montoPagado)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Pendiente</span>
              <span className="text-2xl font-bold text-amber-600">{formatCurrency(documento.montoPendiente)}</span>
            </div>

            {/* Barra de progreso */}
            <div className="pt-2">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${porcentajePagado}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-1">{porcentajePagado.toFixed(0)}% pagado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refinanciamiento activo */}
      {documento.refinanciamiento && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900">🔄 Refinanciamiento Activo</h3>
              <p className="text-sm text-purple-700 mt-1">
                Vence el {formatDate(documento.refinanciamiento.fechaVencimiento)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-700">Pendiente</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(documento.refinanciamiento.montoPendiente)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to={`/pagos/refinanciamientos/${documento.refinanciamiento.id}`}
              className="text-purple-700 hover:underline font-medium"
            >
              Ver detalle del refinanciamiento →
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab("consumos")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              tab === "consumos"
                ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📋 Consumos ({documento.detalles.length})
          </button>
          <button
            onClick={() => setTab("pagos")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              tab === "pagos"
                ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            💵 Pagos ({documento.pagos.length})
          </button>
        </div>

        {/* Contenido de tabs */}
        <div className="overflow-x-auto">
          {tab === "consumos" ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Proveedor/Tienda</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documento.detalles.map((det) => (
                  <tr key={det.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">{formatDate(det.fecha)}</td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-gray-900">{det.empleadoNombre}</span>
                      {det.empleadoCodigo && (
                        <span className="text-xs text-gray-500 ml-2">({det.empleadoCodigo})</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {det.proveedorNombre}
                      {det.tiendaNombre && <span className="text-gray-400"> / {det.tiendaNombre}</span>}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(det.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Comprobante</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Referencia</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Registrado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documento.pagos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay pagos registrados
                    </td>
                  </tr>
                ) : (
                  documento.pagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{pago.numeroComprobante}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{formatDateTime(pago.fecha)}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{pago.metodoPagoNombre}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{pago.referencia || "—"}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-green-600">
                        {formatCurrency(pago.monto)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{pago.registradoPor}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}