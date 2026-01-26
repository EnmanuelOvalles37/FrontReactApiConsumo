/* eslint-disable @typescript-eslint/no-explicit-any */
/*
// src/Paginas/Pagos/DocumentoCxpDetailPage.tsx
// Página de detalle de un documento CxP (Cuenta por Pagar)

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { pagosProveedorApi, type CxpDocumentoListItem, type CxpPagoItem, type ConsumoItem } from "../../Servicios/pagosApi";

interface DocumentoDetalle extends CxpDocumentoListItem {
  proveedor: { id: number; nombre: string; rnc: string };
  pagos: CxpPagoItem[];
  consumos: ConsumoItem[];
  notas?: string;
}

export default function DocumentoCxpDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [documento, setDocumento] = useState<DocumentoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal anular
  const [showAnular, setShowAnular] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  useEffect(() => {
    if (id) {
      loadDocumento(parseInt(id));
    }
  }, [id]);

  const loadDocumento = async (docId: number) => {
    setLoading(true);
    try {
      const data = await pagosProveedorApi.obtenerDocumento(docId);
      setDocumento(data as DocumentoDetalle);
    } catch (err) {
      console.error("Error cargando documento:", err);
      setError("No se pudo cargar el documento");
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = async () => {
    if (!documento) return;

    setAnulando(true);
    try {
      await pagosProveedorApi.anularDocumento(documento.id, motivoAnulacion);
      alert("Documento anulado exitosamente");
      setShowAnular(false);
      loadDocumento(documento.id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Error al anular documento");
    } finally {
      setAnulando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-DO");
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-DO");
  };

  const getEstadoBadge = (estado: string) => {
    const baseClass = "px-3 py-1 rounded-full text-sm font-medium";
    switch (estado) {
      case "Pendiente":
        return <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>Pendiente</span>;
      case "ParcialmentePagado":
        return <span className={`${baseClass} bg-blue-100 text-blue-700`}>Parcialmente Pagado</span>;
      case "Pagado":
        return <span className={`${baseClass} bg-green-100 text-green-700`}>Pagado</span>;
      case "Vencido":
        return <span className={`${baseClass} bg-red-100 text-red-700`}>Vencido</span>;
      case "Anulado":
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>Anulado</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>{estado}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando documento...</div>
      </div>
    );
  }

  if (error || !documento) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error || "Documento no encontrado"}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-xl border hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    );
  }

  const puedePagar = documento.estadoNombre !== "Pagado" && documento.estadoNombre !== "Anulado";
  const puedeAnular = documento.estadoNombre !== "Anulado" && documento.pagos.length === 0;

  return (
    <div className="p-6">
      {/* Header /}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Volver a documentos
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              {documento.numeroDocumento}
              {getEstadoBadge(documento.estadoNombre)}
            </h1>
            <p className="text-gray-500 mt-1">{documento.proveedor.nombre}</p>
          </div>
          <div className="flex gap-2">
            {puedePagar && (
              <Link
                to={`/pagos/proveedores/pagar/${documento.id}`}
                className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Pago
              </Link>
            )}
            {puedeAnular && (
              <button
                onClick={() => setShowAnular(true)}
                className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50"
              >
                Anular
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal /}
        <div className="lg:col-span-2 space-y-6">
          {/* Info general /}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Información General</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Proveedor</p>
                <p className="font-medium">{documento.proveedor.nombre}</p>
                <p className="text-xs text-gray-400">RNC: {documento.proveedor.rnc}</p>
              </div>
              <div>
                <p className="text-gray-500">Factura del Proveedor</p>
                <p className="font-medium">{documento.numeroFacturaProveedor || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Tipo</p>
                <p className="font-medium">{documento.tipoNombre}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha de Emisión</p>
                <p className="font-medium">{formatDate(documento.fechaEmision)}</p>
              </div>
              {documento.periodoDesde && documento.periodoHasta && (
                <div>
                  <p className="text-gray-500">Período</p>
                  <p className="font-medium">
                    {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Vencimiento</p>
                <p className={`font-medium ${new Date(documento.fechaVencimiento) < new Date() && documento.estadoNombre !== "Pagado" ? "text-red-600" : ""}`}>
                  {formatDate(documento.fechaVencimiento)}
                  {documento.diasVencido > 0 && documento.estadoNombre !== "Pagado" && (
                    <span className="ml-2 text-red-500 text-xs">({documento.diasVencido} días vencido)</span>
                  )}
                </p>
              </div>
            </div>
            {documento.concepto && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Concepto</p>
                <p className="text-sm">{documento.concepto}</p>
              </div>
            )}
            {documento.notas && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="text-sm">{documento.notas}</p>
              </div>
            )}
          </div>

          {/* Consumos (si es consolidado) /}
          {documento.consumos && documento.consumos.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Consumos Incluidos ({documento.consumos.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Cliente</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documento.consumos.map((c, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{formatDateTime(c.fecha)}</td>
                        <td className="px-3 py-2">{c.clienteNombre || "—"}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(c.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right">Total:</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(documento.montoTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Pagos /}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Historial de Pagos ({documento.pagos.length})
            </h2>
            {documento.pagos.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay pagos registrados</p>
            ) : (
              <div className="space-y-3">
                {documento.pagos.map((pago) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium">{pago.numeroComprobante}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(pago.fecha)} • {pago.metodoPagoNombre}
                        {pago.referencia && ` • Ref: ${pago.referencia}`}
                      </p>
                      {pago.bancoOrigen && (
                        <p className="text-xs text-gray-400">Banco: {pago.bancoOrigen}</p>
                      )}
                      {pago.registradoPor && (
                        <p className="text-xs text-gray-400">Por: {pago.registradoPor}</p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(pago.monto)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral /}
        <div className="space-y-6">
          {/* Resumen financiero /}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monto Total</span>
                <span className="text-xl font-bold">{formatCurrency(documento.montoTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pagado</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(documento.montoPagado)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Pendiente</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(documento.montoPendiente)}
                </span>
              </div>

              {/* Barra de progreso /}
              <div className="mt-2">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${documento.montoTotal > 0 ? (documento.montoPagado / documento.montoTotal) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {documento.montoTotal > 0
                    ? Math.round((documento.montoPagado / documento.montoTotal) * 100)
                    : 0}% pagado
                </p>
              </div>
            </div>
          </div>

          {/* Acciones rápidas /}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Acciones</h2>
            <div className="space-y-2">
              {puedePagar && (
                <Link
                  to={`/pagos/proveedores/pagar/${documento.id}`}
                  className="block w-full text-center px-4 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200"
                >
                  💰 Registrar Pago
                </Link>
              )}
              <Link
                to={`/pagos/proveedores/proveedor/${documento.proveedorId}/estado-cuenta`}
                className="block w-full text-center px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                📊 Estado de Cuenta
              </Link>
              {puedeAnular && (
                <button
                  onClick={() => setShowAnular(true)}
                  className="w-full px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50"
                >
                  ❌ Anular Documento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Anular /}
      {showAnular && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Anular Documento</h2>
            
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-xl text-sm">
              <p className="font-medium">⚠️ Esta acción no se puede deshacer</p>
              <p>El documento quedará marcado como anulado.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de anulación
              </label>
              <textarea
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Describa el motivo..."
              />
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowAnular(false)}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                disabled={anulando}
              >
                Cancelar
              </button>
              <button
                onClick={handleAnular}
                disabled={anulando}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {anulando ? "Anulando..." : "Confirmar Anulación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} */

  //aqui empieza el ultimo documento que utilice

  /*

  // ============================================================
// DocumentoCxpDetailPage.tsx - CON DESGLOSE DE COMISIONES
// ============================================================
// Muestra el detalle completo del documento CxP incluyendo:
// - Monto Bruto, Comisión, Neto a Pagar
// - Desglose por consumo
// - Historial de pagos
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../Servicios/api';


interface DocumentoCxp {
  id: number;
  numeroDocumento: string;
  numeroFacturaProveedor?: string;
  proveedor: {
    id: number;
    nombre: string;
    rnc?: string;
    porcentajeComision: number;
  };
  tipo: number;
  tipoNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  periodoDesde?: string;
  periodoHasta?: string;
  // Desglose de montos
  montoBruto: number;
  montoComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  estadoNombre: string;
  concepto?: string;
  notas?: string;
  detalles: DetalleConsumo[];
  pagos: Pago[];
}

interface DetalleConsumo {
  id: number;
  consumoId: number;
  fecha: string;
  clienteNombre: string;
  concepto?: string;
  montoBruto: number;
  montoComision: number;
  montoNeto: number;
}

interface Pago {
  id: number;
  numeroComprobante: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre: string;
  referencia?: string;
  registradoPor: string;
}

const DocumentoCxpDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<DocumentoCxp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDocumento(parseInt(id));
    }
  }, [id]);

  const loadDocumento = async (docId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/pagos-proveedor/documentos/${docId}`);
      setDocumento(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el documento');
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'ParcialmentePagado': 'bg-blue-100 text-blue-800',
      'Pagado': 'bg-green-100 text-green-800',
      'Vencido': 'bg-red-100 text-red-800',
      'Anulado': 'bg-gray-100 text-gray-800'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !documento) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Documento no encontrado'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Volver
        </button>
      </div>
    );
  }

  const porcentajeComision = documento.montoBruto > 0 
    ? (documento.montoComision / documento.montoBruto * 100) 
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header /}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {documento.numeroDocumento}
          </h1>
          <p className="text-gray-500">{documento.tipoNombre}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadge(documento.estadoNombre)}`}>
          {documento.estadoNombre}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal /}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ============================================================ /}
          {/* RESUMEN DE MONTOS CON DESGLOSE DE COMISIÓN /}
          {/* ============================================================ /}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Resumen de Montos
            </h2>
            
            <div className="space-y-3">
              {/* Monto Bruto /}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Monto Bruto (Consumos)</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(documento.montoBruto)}
                </span>
              </div>
              
              {/* Comisión /}
              <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-green-50 -mx-6 px-6">
                <div>
                  <span className="text-green-700">Tu Comisión</span>
                  <span className="text-xs text-green-600 ml-2">
                    ({porcentajeComision.toFixed(1)}%)
                  </span>
                </div>
                <span className="font-medium text-green-700">
                  -{formatCurrency(documento.montoComision)}
                </span>
              </div>
              
              {/* Neto a Pagar /}
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                <span className="text-gray-800 font-semibold">Total a Pagar al Proveedor</span>
                <span className="font-bold text-xl text-gray-800">
                  {formatCurrency(documento.montoTotal)}
                </span>
              </div>
              
              {/* Pagado /}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Monto Pagado</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(documento.montoPagado)}
                </span>
              </div>
              
              {/* Pendiente /}
              <div className="flex justify-between items-center py-3 bg-gray-50 -mx-6 px-6 rounded-b-lg">
                <span className="text-gray-800 font-semibold">Saldo Pendiente</span>
                <span className={`font-bold text-xl ${documento.montoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(documento.montoPendiente)}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ /}
          {/* DETALLE DE CONSUMOS CON COMISIÓN /}
          {/* ============================================================ /}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Detalle de Consumos ({documento.detalles?.length || 0})
            </h2>
            
            {documento.detalles && documento.detalles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Fecha</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Cliente</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-600">Bruto</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-600 text-green-600">Comisión</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-600">Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documento.detalles.map((detalle) => (
                      <tr key={detalle.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-gray-600">
                          {formatDateTime(detalle.fecha)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium text-gray-800">{detalle.clienteNombre}</div>
                          {detalle.concepto && (
                            <div className="text-xs text-gray-500">{detalle.concepto}</div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-800">
                          {formatCurrency(detalle.montoBruto)}
                        </td>
                        <td className="py-3 px-2 text-right text-green-600">
                          {formatCurrency(detalle.montoComision)}
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-gray-800">
                          {formatCurrency(detalle.montoNeto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={2} className="py-3 px-2 text-gray-700">TOTALES</td>
                      <td className="py-3 px-2 text-right text-gray-800">
                        {formatCurrency(documento.montoBruto)}
                      </td>
                      <td className="py-3 px-2 text-right text-green-600">
                        {formatCurrency(documento.montoComision)}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-800">
                        {formatCurrency(documento.montoTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay detalles de consumos</p>
            )}
          </div>

          {/* ============================================================ /}
          {/* HISTORIAL DE PAGOS /}
          {/* ============================================================ /}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Pagos Realizados ({documento.pagos?.length || 0})
              </h2>
              {documento.montoPendiente > 0 && (
                <Link
                  to={`/pagos/cxp/${documento.id}/pagar`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Registrar Pago
                </Link>
              )}
            </div>
            
            {documento.pagos && documento.pagos.length > 0 ? (
              <div className="space-y-3">
                {documento.pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{pago.numeroComprobante}</div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(pago.fecha)} • {pago.metodoPagoNombre}
                        {pago.referencia && ` • Ref: ${pago.referencia}`}
                      </div>
                      <div className="text-xs text-gray-400">Por: {pago.registradoPor}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(pago.monto)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
            )}
          </div>
        </div>

        {/* Columna Lateral /}
        <div className="space-y-6">
          {/* Información del Proveedor /}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Proveedor</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Nombre</div>
                <div className="font-medium text-gray-800">{documento.proveedor.nombre}</div>
              </div>
              {documento.proveedor.rnc && (
                <div>
                  <div className="text-sm text-gray-500">RNC</div>
                  <div className="text-gray-800">{documento.proveedor.rnc}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Comisión Configurada</div>
                <div className="text-gray-800">{documento.proveedor.porcentajeComision}%</div>
              </div>
            </div>
          </div>

          {/* Información del Documento /}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Fecha de Emisión</div>
                <div className="text-gray-800">{formatDate(documento.fechaEmision)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fecha de Vencimiento</div>
                <div className={`font-medium ${new Date(documento.fechaVencimiento) < new Date() && documento.montoPendiente > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {formatDate(documento.fechaVencimiento)}
                </div>
              </div>
              {documento.periodoDesde && documento.periodoHasta && (
                <div>
                  <div className="text-sm text-gray-500">Período</div>
                  <div className="text-gray-800">
                    {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
                  </div>
                </div>
              )}
              {documento.numeroFacturaProveedor && (
                <div>
                  <div className="text-sm text-gray-500">Factura Proveedor</div>
                  <div className="text-gray-800">{documento.numeroFacturaProveedor}</div>
                </div>
              )}
              {documento.concepto && (
                <div>
                  <div className="text-sm text-gray-500">Concepto</div>
                  <div className="text-gray-800">{documento.concepto}</div>
                </div>
              )}
              {documento.notas && (
                <div>
                  <div className="text-sm text-gray-500">Notas</div>
                  <div className="text-gray-800">{documento.notas}</div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen Visual de Comisión /}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Tu Ganancia</h3>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(documento.montoComision)}
            </div>
            <div className="text-green-100 text-sm">
              {porcentajeComision.toFixed(1)}% del monto bruto
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentoCxpDetailPage; */

// src/Paginas/Pagos/CxP/GenerarConsolidadoCxpPage.tsx
// Página para generar consolidado CxP a un proveedor

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../Servicios/api";


type Proveedor = {
  id: number;
  nombre: string;
  diasCorte: number | null;
  porcentajeComision: number;
};

type ConsumoPreview = {
  id: number;
  fecha: string;
  clienteNombre: string;
  empresaNombre: string;
  montoBruto: number;
  montoComision: number;
  montoNeto: number;
};

type PreviewData = {
  proveedor: { id: number; nombre: string; porcentajeComision: number };
  periodoDesde: string;
  periodoHasta: string;
  cantidadConsumos: number;
  montoBruto: number;
  montoComision: number;
  montoNeto: number;
  consumos: ConsumoPreview[];
};

export default function GenerarConsolidadoCxpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [periodoDesde, setPeriodoDesde] = useState("");
  const [periodoHasta, setPeriodoHasta] = useState("");
  const [diasParaPagar, setDiasParaPagar] = useState(30);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [concepto, setConcepto] = useState("");
  const [notas, setNotas] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProveedores();
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setPeriodoHasta(hoy.toISOString().split('T')[0]);
    setPeriodoDesde(inicioMes.toISOString().split('T')[0]);
    
    const provId = searchParams.get("proveedorId");
    if (provId) setProveedorId(Number(provId));
  }, []);

  const loadProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  };

  const loadPreview = async () => {
    if (!proveedorId || !periodoDesde || !periodoHasta) {
      setError("Selecciona proveedor y período");
      return;
    }

    try {
      setLoadingPreview(true);
      setError("");
      const res = await api.get(`/api/cxp/proveedores/${proveedorId}/preview-consolidado`, {
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
    if (!proveedorId || !preview) return;

    try {
      setLoading(true);
      setError("");
      const res = await api.post(`/api/cxp/proveedores/${proveedorId}/consolidar`, {
        periodoDesde,
        periodoHasta,
        diasParaPagar,
        numeroFacturaProveedor: numeroFactura || null,
        concepto: concepto || null,
        notas: notas || null
      });
      
      navigate(`/pagos/cxp/documentos/${res.data.id}`, {
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

  const proveedorSeleccionado = proveedores.find(p => p.id === proveedorId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/cxp" className="text-gray-400 hover:text-gray-600">CxP</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Generar Consolidado</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">📋 Generar Consolidado CxP</h1>
        <p className="text-gray-500 mt-1">Agrupa los consumos en tiendas de un proveedor y calcula tu comisión</p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
            <select
              value={proveedorId || ""}
              onChange={(e) => { setProveedorId(Number(e.target.value)); setPreview(null); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre} 
                  {prov.porcentajeComision > 0 && ` (${prov.porcentajeComision}% comisión)`}
                </option>
              ))}
            </select>
            {proveedorSeleccionado && proveedorSeleccionado.porcentajeComision > 0 && (
              <p className="text-sm text-green-600 mt-1">
                💰 Comisión: {proveedorSeleccionado.porcentajeComision}%
              </p>
            )}
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

          {/* Número de factura del proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Factura del Proveedor (opcional)</label>
            <input
              type="text"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              placeholder="Ej: FAC-001234"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Concepto (opcional)</label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej: Consumos diciembre 2025"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Observaciones adicionales..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Botón preview */}
        <button
          onClick={loadPreview}
          disabled={!proveedorId || !periodoDesde || !periodoHasta || loadingPreview}
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
          {/* Resumen con comisión */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="font-semibold text-amber-900 mb-4">📋 Resumen del Consolidado</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Proveedor</p>
                <p className="font-semibold text-gray-900 truncate">{preview.proveedor.nombre}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Consumos</p>
                <p className="text-2xl font-bold text-amber-600">{preview.cantidadConsumos}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Monto Bruto</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(preview.montoBruto)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border-2 border-green-300">
                <p className="text-sm text-green-700">Tu Comisión</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(preview.montoComision)}</p>
                <p className="text-xs text-green-600">{preview.proveedor.porcentajeComision}%</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Neto a Pagar</p>
                <p className="text-xl font-bold text-amber-700">{formatCurrency(preview.montoNeto)}</p>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Empresa</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Bruto</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Comisión</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.consumos.slice(0, 50).map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(c.fecha)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{c.clienteNombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.empresaNombre}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(c.montoBruto)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{formatCurrency(c.montoComision)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(c.montoNeto)}</td>
                    </tr>
                  ))}
                </tbody>
                {/* Fila de totales */}
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm text-gray-700">TOTALES</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(preview.montoBruto)}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-700">{formatCurrency(preview.montoComision)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(preview.montoNeto)}</td>
                  </tr>
                </tfoot>
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
            className="w-full py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg disabled:opacity-50"
          >
            {loading ? "Generando..." : (
              <>
                ✅ Generar Consolidado • Pagar {formatCurrency(preview.montoNeto)} • Ganar {formatCurrency(preview.montoComision)}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}