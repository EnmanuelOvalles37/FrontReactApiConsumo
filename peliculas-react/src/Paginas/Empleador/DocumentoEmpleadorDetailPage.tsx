/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Empleador/DocumentoEmpleadorDetailPage.tsx
// Detalle de documento CxC para empleadores

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

interface DocumentoDetalle {
  id: number;
  numeroDocumento: string;
  fechaEmision: string;
  fechaVencimiento: string;
  periodoDesde: string;
  periodoHasta: string;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  cantidadConsumos: number;
  cantidadEmpleados: number;
  diasVencido: number;
}

interface ConsumoDetalle {
  id: number;
  fecha: string;
  empleadoNombre: string;
  empleadoCodigo: string;
  proveedorNombre: string;
  tiendaNombre: string;
  concepto: string;
  monto: number;
}

interface PagoDetalle {
  id: number;
  fecha: string;
  monto: number;
  metodoPago: string;
  referencia: string;
  numeroComprobante: string;
}

export default function DocumentoEmpleadorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<DocumentoDetalle | null>(null);
  const [consumos, setConsumos] = useState<ConsumoDetalle[]>([]);
  const [pagos, setPagos] = useState<PagoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"consumos" | "pagos">("consumos");

  useEffect(() => {
    if (id) {
      cargarDocumento();
    }
  }, [id]);

  const cargarDocumento = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/empleador/documentos-cxc/${id}`);
      setDocumento(res.data.documento);
      setConsumos(res.data.consumos || []);
      setPagos(res.data.pagos || []);
    } catch (err: any) {
      console.error("Error cargando documento:", err);
      if (err.response?.status === 404) {
        setError("Documento no encontrado");
      } else if (err.response?.status === 403) {
        setError("No tienes permiso para ver este documento");
      } else {
        setError("Error al cargar el documento");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) =>
    `RD$${(value ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-DO");

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("es-DO", {
      dateStyle: "short",
      timeStyle: "short"
    });

  const getEstadoDocumento = (estado: number) => {
    const estados: Record<number, { label: string; color: string }> = {
      0: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
      1: { label: "Parcial", color: "bg-blue-100 text-blue-700" },
      2: { label: "Pagado", color: "bg-green-100 text-green-700" }
    };
    return estados[estado] || { label: "Desconocido", color: "bg-gray-100 text-gray-700" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !documento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{error || "Documento no encontrado"}</p>
          <button
            onClick={() => navigate("/dashboard-empleador")}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const estado = getEstadoDocumento(documento.estado);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-sky-600 to-sky-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard-empleador")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-xl font-bold">Documento {documento.numeroDocumento}</h1>
              <p className="text-sky-100 text-sm">Detalle del documento CxC</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Info del documento */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{documento.numeroDocumento}</h2>
              <p className="text-gray-500">
                Período: {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${estado.color}`}>
              {estado.label}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(documento.montoTotal)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600">Pagado</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(documento.montoPagado)}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-600">Pendiente</p>
              <p className="text-xl font-bold text-amber-700">{formatCurrency(documento.montoPendiente)}</p>
            </div>
            <div className="bg-sky-50 rounded-xl p-4">
              <p className="text-sm text-sky-600">Consumos</p>
              <p className="text-xl font-bold text-sky-700">
                {documento.cantidadConsumos}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  ({documento.cantidadEmpleados} emp)
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Fecha de emisión:</span>
              <span className="ml-2 font-medium">{formatDate(documento.fechaEmision)}</span>
            </div>
            <div>
              <span className="text-gray-500">Fecha de vencimiento:</span>
              <span className={`ml-2 font-medium ${documento.diasVencido > 0 ? "text-red-600" : ""}`}>
                {formatDate(documento.fechaVencimiento)}
                {documento.diasVencido > 0 && ` (+${documento.diasVencido} días)`}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("consumos")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "consumos"
                  ? "text-sky-600 bg-sky-50 border-b-2 border-sky-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              🛒 Consumos ({consumos.length})
            </button>
            <button
              onClick={() => setActiveTab("pagos")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "pagos"
                  ? "text-sky-600 bg-sky-50 border-b-2 border-sky-600"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              💳 Pagos ({pagos.length})
            </button>
          </div>

          {/* Tab: Consumos */}
          {activeTab === "consumos" && (
            <div className="overflow-x-auto">
              {consumos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay consumos en este documento
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Empleado</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Proveedor</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Concepto</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {consumos.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{formatDateTime(c.fecha)}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{c.empleadoNombre}</p>
                          <p className="text-xs text-gray-500">{c.empleadoCodigo}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {c.proveedorNombre}
                          {c.tiendaNombre && <span className="text-gray-400 text-xs ml-1">({c.tiendaNombre})</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.concepto || "-"}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(c.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-600">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {formatCurrency(consumos.reduce((sum, c) => sum + c.monto, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}

          {/* Tab: Pagos */}
          {activeTab === "pagos" && (
            <div className="overflow-x-auto">
              {pagos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay pagos registrados para este documento
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Comprobante</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Método</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Referencia</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pagos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{formatDateTime(p.fecha)}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-900">{p.numeroComprobante}</td>
                        <td className="px-4 py-3 text-gray-600">{p.metodoPago}</td>
                        <td className="px-4 py-3 text-gray-600">{p.referencia || "-"}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          {formatCurrency(p.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-600">
                        Total pagado:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">
                        {formatCurrency(pagos.reduce((sum, p) => sum + p.monto, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}