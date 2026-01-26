/*
// src/Paginas/Pagos/CxP/CxpDocumentoDetailPage.tsx
// Detalle de un documento CxP con consumos, comisiones y pagos

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../Servicios/api";


type Detalle = {
  id: number;
  consumoId: number;
  fecha: string;
  clienteNombre: string;
  empresaNombre: string;
  concepto: string;
  montoBruto: number;
  montoComision: number;
  montoNeto: number;
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

type Documento = {
  id: number;
  numeroDocumento: string;
  numeroFacturaProveedor: string | null;
  proveedor: { id: number; nombre: string; rnc: string; porcentajeComision: number };
  periodoDesde: string;
  periodoHasta: string;
  cantidadConsumos: number;
  montoBruto: number;
  montoComision: number;
  porcentajeComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  estadoNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  concepto: string | null;
  notas: string | null;
  detalles: Detalle[];
  pagos: Pago[];
};

export default function CxpDocumentoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"consumos" | "pagos">("consumos");

  useEffect(() => {
    if (id) loadDocumento();
  }, [id]);

  const loadDocumento = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cxp/documentos/${id}`);
      setDocumento(res.data);
    } catch (error) {
      console.error("Error cargando documento:", error);
    } finally {
      setLoading(false);
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
      3: "bg-gray-100 text-gray-700"
    };
    const labels: Record<number, string> = {
      0: "Pendiente",
      1: "Parcial",
      2: "Pagado",
      3: "Anulado"
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
      {/* Header /}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
            <span className="text-gray-300">/</span>
            <Link to="/pagos/cxp" className="text-gray-400 hover:text-gray-600">CxP</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{documento.numeroDocumento}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{documento.numeroDocumento}</h1>
            {getEstadoBadge(documento.estado)}
          </div>
        </div>
        {documento.estado !== 2 && documento.estado !== 3 && (
          <button
            onClick={() => navigate(`/pagos/cxp/documentos/${id}/pagar`)}
            className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
          >
            💳 Registrar Pago
          </button>
        )}
      </div>

      {/* Info principal /}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del documento /}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📋 Información del Documento</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Proveedor</p>
              <p className="font-medium text-gray-900">{documento.proveedor.nombre}</p>
              {documento.proveedor.rnc && (
                <p className="text-sm text-gray-500">RNC: {documento.proveedor.rnc}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">% Comisión</p>
              <p className="font-medium text-green-600">{documento.porcentajeComision.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Período</p>
              <p className="font-medium text-gray-900">
                {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Consumos</p>
              <p className="font-medium text-gray-900">{documento.cantidadConsumos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Emisión</p>
              <p className="font-medium text-gray-900">{formatDate(documento.fechaEmision)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Vencimiento</p>
              <p className="font-medium text-gray-900">{formatDate(documento.fechaVencimiento)}</p>
            </div>
          </div>
        </div>

        {/* Resumen de montos con comisión /}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">💰 Desglose</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Monto Bruto</span>
              <span className="font-medium text-gray-900">{formatCurrency(documento.montoBruto)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-green-700 font-medium">Tu Comisión</span>
              <span className="font-bold text-green-700">{formatCurrency(documento.montoComision)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-600">Neto a Pagar</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(documento.montoTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Pagado</span>
              <span className="font-medium text-sky-600">{formatCurrency(documento.montoPagado)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Pendiente</span>
              <span className="text-2xl font-bold text-amber-600">{formatCurrency(documento.montoPendiente)}</span>
            </div>

            {/* Barra de progreso /}
            <div className="pt-2">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${porcentajePagado}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-1">{porcentajePagado.toFixed(0)}% pagado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs /}
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
            📋 Consumos con Comisión ({documento.detalles.length})
          </button>
          <button
            onClick={() => setTab("pagos")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              tab === "pagos"
                ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            💳 Pagos ({documento.pagos.length})
          </button>
        </div>

        {/* Contenido de tabs /}
        <div className="overflow-x-auto">
          {tab === "consumos" ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Empresa</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Bruto</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Comisión</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documento.detalles.map((det) => (
                  <tr key={det.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">{formatDate(det.fecha)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{det.clienteNombre}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{det.empresaNombre}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(det.montoBruto)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-green-600">
                      {formatCurrency(det.montoComision)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(det.montoNeto)}
                    </td>
                  </tr>
                ))}
                {/* Fila de totales /}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="px-6 py-3 text-sm text-gray-700">TOTALES</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    {formatCurrency(documento.montoBruto)}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-green-700">
                    {formatCurrency(documento.montoComision)}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    {formatCurrency(documento.montoTotal)}
                  </td>
                </tr>
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
                      <td className="px-6 py-3 text-sm text-right font-semibold text-amber-600">
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
} */

  // src/Paginas/Pagos/CxP/CxpDocumentoDetailPage.tsx
// Detalle de un documento CxP con consumos, comisiones y pagos

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../Servicios/api";
import DocumentoCxpDetalleModal from "../../Componentes/Comprobantes/DocumentoCxpDetalleModal";


type Detalle = {
  id: number;
  consumoId: number;
  fecha: string;
  clienteNombre: string;
  empresaNombre: string;
  concepto: string;
  montoBruto: number;
  montoComision: number;
  montoNeto: number;
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

type Documento = {
  id: number;
  numeroDocumento: string;
  numeroFacturaProveedor: string | null;
  proveedor: { id: number; nombre: string; rnc: string; porcentajeComision: number };
  periodoDesde: string;
  periodoHasta: string;
  cantidadConsumos: number;
  montoBruto: number;
  montoComision: number;
  porcentajeComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  estadoNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  concepto: string | null;
  notas: string | null;
  detalles: Detalle[];
  pagos: Pago[];
};

export default function CxpDocumentoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"consumos" | "pagos">("consumos");
  
  // Estado para el modal de detalle
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);

  useEffect(() => {
    if (id) loadDocumento();
  }, [id]);

  const loadDocumento = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cxp/documentos/${id}`);
      setDocumento(res.data);
    } catch (error) {
      console.error("Error cargando documento:", error);
    } finally {
      setLoading(false);
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
      3: "bg-gray-100 text-gray-700"
    };
    const labels: Record<number, string> = {
      0: "Pendiente",
      1: "Parcial",
      2: "Pagado",
      3: "Anulado"
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
            <Link to="/pagos/cxp" className="text-gray-400 hover:text-gray-600">CxP</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{documento.numeroDocumento}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{documento.numeroDocumento}</h1>
            {getEstadoBadge(documento.estado)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón para abrir modal de detalle completo */}
          <button
            onClick={() => setModalDetalleOpen(true)}
            className="px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors font-medium flex items-center gap-2"
          >
            🔍 Ver Detalle Completo
          </button>
          {documento.estado !== 2 && documento.estado !== 3 && (
            <button
              onClick={() => navigate(`/pagos/cxp/documentos/${id}/pagar`)}
              className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
            >
              💳 Registrar Pago
            </button>
          )}
        </div>
      </div>

      {/* Info principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del documento */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📋 Información del Documento</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Proveedor</p>
              <p className="font-medium text-gray-900">{documento.proveedor.nombre}</p>
              {documento.proveedor.rnc && (
                <p className="text-sm text-gray-500">RNC: {documento.proveedor.rnc}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">% Comisión</p>
              <p className="font-medium text-green-600">{documento.porcentajeComision.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Período</p>
              <p className="font-medium text-gray-900">
                {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Consumos</p>
              <p className="font-medium text-gray-900">{documento.cantidadConsumos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Emisión</p>
              <p className="font-medium text-gray-900">{formatDate(documento.fechaEmision)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Vencimiento</p>
              <p className="font-medium text-gray-900">{formatDate(documento.fechaVencimiento)}</p>
            </div>
          </div>
        </div>

        {/* Resumen de montos con comisión */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">💰 Desglose</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Monto Bruto</span>
              <span className="font-medium text-gray-900">{formatCurrency(documento.montoBruto)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-green-700 font-medium">Tu Comisión</span>
              <span className="font-bold text-green-700">{formatCurrency(documento.montoComision)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-600">Neto a Pagar</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(documento.montoTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Pagado</span>
              <span className="font-medium text-sky-600">{formatCurrency(documento.montoPagado)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Pendiente</span>
              <span className="text-2xl font-bold text-amber-600">{formatCurrency(documento.montoPendiente)}</span>
            </div>

            {/* Barra de progreso */}
            <div className="pt-2">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${porcentajePagado}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-1">{porcentajePagado.toFixed(0)}% pagado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setTab("consumos")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                tab === "consumos"
                  ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📋 Consumos con Comisión ({documento.detalles.length})
            </button>
            <button
              onClick={() => setTab("pagos")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                tab === "pagos"
                  ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              💳 Pagos ({documento.pagos.length})
            </button>
          </div>
          
          {/* Botón Ver Detalle junto a los tabs */}
          <button
            onClick={() => setModalDetalleOpen(true)}
            className="mr-4 px-3 py-1.5 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver completo
          </button>
        </div>

        {/* Contenido de tabs */}
        <div className="overflow-x-auto">
          {tab === "consumos" ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Empresa</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Bruto</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Comisión</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documento.detalles.map((det) => (
                  <tr key={det.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">{formatDate(det.fecha)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{det.clienteNombre}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{det.empresaNombre}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(det.montoBruto)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-green-600">
                      {formatCurrency(det.montoComision)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(det.montoNeto)}
                    </td>
                  </tr>
                ))}
                {/* Fila de totales */}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="px-6 py-3 text-sm text-gray-700">TOTALES</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    {formatCurrency(documento.montoBruto)}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-green-700">
                    {formatCurrency(documento.montoComision)}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    {formatCurrency(documento.montoTotal)}
                  </td>
                </tr>
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
                      <td className="px-6 py-3 text-sm text-right font-semibold text-amber-600">
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

      {/* Modal de Detalle Completo */}
      <DocumentoCxpDetalleModal
        open={modalDetalleOpen}
        documentoId={documento.id}
        onClose={() => setModalDetalleOpen(false)}
      />
    </div>
  );
}