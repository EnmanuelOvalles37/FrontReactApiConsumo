/*
/* eslint-disable @typescript-eslint/no-explicit-any /
// src/Componentes/Documentos/DocumentoCxcDetalleModal.tsx
// Modal para ver el detalle de un documento CxC con sus consumos

import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import api from "../../Servicios/api";

type Props = {
  open: boolean;
  documentoId: number | null;
  onClose: () => void;
};

type Documento = {
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
  refinanciado: boolean;
  notas: string | null;
  anulado: boolean;
  empresaId: number;
  empresaNombre: string;
  empresaRnc: string | null;
  empresaTelefono: string | null;
  empresaEmail: string | null;
  empresaDireccion: string | null;
  creadoPor: string | null;
  creadoUtc: string;
};

type Consumo = {
  id: number;
  fecha: string;
  monto: number;
  nota: string | null;
  clienteCodigo: string;
  clienteNombre: string;
  clienteGrupo: string | null;
  proveedorNombre: string;
  tiendaNombre: string | null;
  registradoPor: string | null;
};

type ResumenEmpleado = {
  clienteId: number;
  codigo: string;
  nombre: string;
  grupo: string | null;
  totalConsumos: number;
  montoTotal: number;
};

type ResumenProveedor = {
  proveedorId: number;
  proveedorNombre: string;
  totalConsumos: number;
  montoTotal: number;
};

type Pago = {
  id: number;
  numeroRecibo: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  referencia: string | null;
  banco: string | null;
};

const ESTADOS = ["Pendiente", "Parcial", "Pagado"];
const ESTADOS_COLOR = ["bg-amber-100 text-amber-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700"];
const METODOS_PAGO = ["Efectivo", "Transferencia", "Cheque", "Tarjeta Crédito", "Tarjeta Débito", "Otro"];

export default function DocumentoCxcDetalleModal({ open, documentoId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [resumenEmpleados, setResumenEmpleados] = useState<ResumenEmpleado[]>([]);
  const [resumenProveedores, setResumenProveedores] = useState<ResumenProveedor[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [activeTab, setActiveTab] = useState<"consumos" | "empleados" | "proveedores" | "pagos">("consumos");
  const [busqueda, setBusqueda] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && documentoId) {
      cargarDetalle();
    }
  }, [open, documentoId]);

  const cargarDetalle = async () => {
    if (!documentoId) return;
    setLoading(true);
    try {
      const res = await api.get(`/documentos/cxc/${documentoId}`);
      setDocumento(res.data.documento);
      setConsumos(res.data.consumos || []);
      setResumenEmpleados(res.data.resumenEmpleados || []);
      setResumenProveedores(res.data.resumenProveedores || []);
      setPagos(res.data.pagos || []);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Documento_CxC_${documento?.numeroDocumento || "detalle"}`
  });

  const formatCurrency = (value: number) =>
    `RD$${(value || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("es-DO") : "—";

  const formatDateTime = (date: string) =>
    date ? new Date(date).toLocaleString("es-DO") : "—";

  const consumosFiltrados = consumos.filter(c =>
    c.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.clienteCodigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.proveedorNombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay /}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal /}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header /}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {loading ? "Cargando..." : `Documento ${documento?.numeroDocumento}`}
                </h3>
                <p className="text-sky-100 text-sm">
                  {documento?.empresaNombre} {documento?.empresaRnc ? `(${documento.empresaRnc})` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrint()}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando detalle del documento...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Contenido imprimible /}
            <div ref={printRef} className="flex-1 overflow-y-auto">
              {/* Info del documento /}
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                {/* Header para impresión /}
                <div className="hidden print:block text-center mb-6">
                  <h1 className="text-2xl font-bold">Detalle de Factura CxC</h1>
                  <p className="text-gray-600">{documento?.empresaNombre}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Documento</p>
                    <p className="font-semibold text-gray-900">{documento?.numeroDocumento}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Estado</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ESTADOS_COLOR[documento?.estado || 0]}`}>
                      {ESTADOS[documento?.estado || 0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Periodo</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(documento?.periodoDesde || "")} - {formatDate(documento?.periodoHasta || "")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Vencimiento</p>
                    <p className="font-medium text-gray-900">{formatDate(documento?.fechaVencimiento || "")}</p>
                  </div>
                </div>

                {/* Montos /}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Total Factura</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(documento?.montoTotal || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Pagado</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(documento?.montoPagado || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Pendiente</p>
                    <p className="text-xl font-bold text-amber-600">{formatCurrency(documento?.montoPendiente || 0)}</p>
                  </div>
                </div>

                {/* Stats /}
                <div className="flex gap-6 mt-4 text-sm text-gray-600">
                  <span>📝 {documento?.cantidadConsumos} consumos</span>
                  <span>👥 {documento?.cantidadEmpleados} empleados</span>
                  <span>🏪 {resumenProveedores.length} proveedores</span>
                </div>
              </div>

              {/* Tabs /}
              <div className="border-b border-gray-100 px-6 print:hidden">
                <div className="flex gap-1">
                  {[
                    { key: "consumos", label: "Consumos", icon: "🛒", count: consumos.length },
                    { key: "empleados", label: "Por Empleado", icon: "👥", count: resumenEmpleados.length },
                    { key: "proveedores", label: "Por Proveedor", icon: "🏪", count: resumenProveedores.length },
                    { key: "pagos", label: "Pagos", icon: "💳", count: pagos.length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-sky-600 text-sky-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.icon} {tab.label}
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido de tabs /}
              <div className="p-6">
                {/* TAB: CONSUMOS /}
                {activeTab === "consumos" && (
                  <div>
                    {/* Buscador /}
                    <div className="mb-4 print:hidden">
                      <input
                        type="text"
                        placeholder="Buscar por empleado, codigo o proveedor..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>

                    {/* Titulo para impresión/}
                    <h3 className="hidden print:block text-lg font-semibold mb-4">Listado de Consumos</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Fecha</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Codigo</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Empleado</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Grupo</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Proveedor</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Tienda</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {consumosFiltrados.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-600">{formatDateTime(c.fecha)}</td>
                              <td className="px-3 py-2 font-mono text-gray-600">{c.clienteCodigo}</td>
                              <td className="px-3 py-2 font-medium text-gray-900">{c.clienteNombre}</td>
                              <td className="px-3 py-2 text-gray-500">{c.clienteGrupo || "—"}</td>
                              <td className="px-3 py-2 text-gray-600">{c.proveedorNombre}</td>
                              <td className="px-3 py-2 text-gray-500">{c.tiendaNombre || "—"}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(c.monto)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={6} className="px-3 py-2 text-right font-semibold text-gray-700">TOTAL:</td>
                            <td className="px-3 py-2 text-right font-bold text-sky-700">
                              {formatCurrency(consumosFiltrados.reduce((sum, c) => sum + c.monto, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {consumosFiltrados.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No se encontraron consumos
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: POR EMPLEADO /}
                {activeTab === "empleados" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-semibold mb-4">Resumen por Empleado</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Codigo</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Empleado</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Grupo</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600">Consumos</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resumenEmpleados.map((e) => (
                            <tr key={e.clienteId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-gray-600">{e.codigo}</td>
                              <td className="px-3 py-2 font-medium text-gray-900">{e.nombre}</td>
                              <td className="px-3 py-2 text-gray-500">{e.grupo || "—"}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{e.totalConsumos}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(e.montoTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-3 py-2 text-right font-semibold text-gray-700">TOTALES:</td>
                            <td className="px-3 py-2 text-center font-bold text-gray-700">
                              {resumenEmpleados.reduce((sum, e) => sum + e.totalConsumos, 0)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-sky-700">
                              {formatCurrency(resumenEmpleados.reduce((sum, e) => sum + e.montoTotal, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: POR PROVEEDOR /}
                {activeTab === "proveedores" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-semibold mb-4">Resumen por Proveedor</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Proveedor</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600">Consumos</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resumenProveedores.map((p) => (
                            <tr key={p.proveedorId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{p.proveedorNombre}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{p.totalConsumos}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(p.montoTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="px-3 py-2 text-right font-semibold text-gray-700">TOTALES:</td>
                            <td className="px-3 py-2 text-center font-bold text-gray-700">
                              {resumenProveedores.reduce((sum, p) => sum + p.totalConsumos, 0)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-sky-700">
                              {formatCurrency(resumenProveedores.reduce((sum, p) => sum + p.montoTotal, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: PAGOS /}
                {activeTab === "pagos" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-semibold mb-4">Historial de Pagos</h3>
                    {pagos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-3xl block mb-2">💳</span>
                        No hay pagos registrados para este documento
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Recibo</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Fecha</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Metodo</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Referencia</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Banco</th>
                              <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {pagos.map((p) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono text-gray-900">{p.numeroRecibo}</td>
                                <td className="px-3 py-2 text-gray-600">{formatDateTime(p.fecha)}</td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {METODOS_PAGO[p.metodoPago] || "Otro"}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-500">{p.referencia || "—"}</td>
                                <td className="px-3 py-2 text-gray-500">{p.banco || "—"}</td>
                                <td className="px-3 py-2 text-right font-semibold text-green-600">{formatCurrency(p.monto)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={5} className="px-3 py-2 text-right font-semibold text-gray-700">TOTAL PAGADO:</td>
                              <td className="px-3 py-2 text-right font-bold text-green-700">
                                {formatCurrency(pagos.reduce((sum, p) => sum + p.monto, 0))}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pie para impresión /}
              <div className="hidden print:block p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                Generado el {new Date().toLocaleString("es-DO")}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} */

  // src/Componentes/Documentos/DocumentoCxcDetalleModal.tsx
// Modal para ver el detalle de un documento CxC con sus consumos

import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import api from "../../Servicios/api";

type Props = {
  open: boolean;
  documentoId: number | null;
  onClose: () => void;
};

type Documento = {
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
  refinanciado: boolean;
  notas: string | null;
  anulado: boolean;
  empresaId: number;
  empresaNombre: string;
  empresaRnc: string | null;
  empresaTelefono: string | null;
  empresaEmail: string | null;
  empresaDireccion: string | null;
  creadoPor: string | null;
  creadoUtc: string;
};

type Consumo = {
  id: number;
  fecha: string;
  monto: number;
  nota: string | null;
  referencia: string | null;
  concepto: string | null;
  clienteId: number;
  clienteCodigo: string;
  clienteNombre: string;
  clienteCedula: string | null;
  clienteGrupo: string | null;
  proveedorNombre: string;
  tiendaNombre: string | null;
  registradoPor: string | null;
};

type ResumenEmpleado = {
  clienteId: number;
  codigo: string;
  nombre: string;
  grupo: string | null;
  totalConsumos: number;
  montoTotal: number;
};

type ResumenProveedor = {
  proveedorId: number;
  proveedorNombre: string;
  totalConsumos: number;
  montoTotal: number;
};

type Pago = {
  id: number;
  numeroRecibo: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  referencia: string | null;
  banco: string | null;
  notas: string | null;
  registradoPor: string | null;
};

const ESTADOS = ["Pendiente", "Parcial", "Pagado", "Refinanciado", "Anulado"];
const ESTADOS_COLOR = [
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-gray-100 text-gray-700"
];
const METODOS_PAGO = ["Efectivo", "Transferencia", "Cheque", "Tarjeta Crédito", "Tarjeta Débito", "Otro"];

export default function DocumentoCxcDetalleModal({ open, documentoId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [resumenEmpleados, setResumenEmpleados] = useState<ResumenEmpleado[]>([]);
  const [resumenProveedores, setResumenProveedores] = useState<ResumenProveedor[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [activeTab, setActiveTab] = useState<"consumos" | "empleados" | "proveedores" | "pagos">("consumos");
  const [busqueda, setBusqueda] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && documentoId) {
      cargarDetalle();
      setActiveTab("consumos");
      setBusqueda("");
    }
  }, [open, documentoId]);

  const cargarDetalle = async () => {
    if (!documentoId) return;
    setLoading(true);
    try {
      const res = await api.get(`/documentos/cxc/${documentoId}`);
      setDocumento(res.data.documento);
      setConsumos(res.data.consumos || []);
      setResumenEmpleados(res.data.resumenEmpleados || []);
      setResumenProveedores(res.data.resumenProveedores || []);
      setPagos(res.data.pagos || []);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Documento_CxC_${documento?.numeroDocumento || "detalle"}`
  });

  const handleExportPdf = async () => {
    if (!documento) return;
    
    setExportingPdf(true);
    try {
      // Usar el endpoint de exportación del backend si existe,
      // o generar el PDF en el cliente usando la impresión
      const response = await api.get(`/documentos/cxc/${documentoId}/exportar-pdf`, {
        responseType: 'blob'
      });
      
      // Crear un link para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CxC_${documento.numeroDocumento}_${documento.empresaNombre.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error)  {
      console.error(error);
      // Si no existe el endpoint, usar la función de impresión como fallback
      console.log("Endpoint de PDF no disponible, usando impresión...");
      handlePrint();
    } finally {
      setExportingPdf(false);
    }
  };

  const formatCurrency = (value: number) =>
    `RD$${(value || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString("es-DO") : "—";

  const formatDateTime = (date: string) =>
    date ? new Date(date).toLocaleString("es-DO") : "—";

  const consumosFiltrados = consumos.filter(c =>
    c.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.clienteCodigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.proveedorNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.clienteCedula?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {loading ? "Cargando..." : `Detalle de Consumos - ${documento?.numeroDocumento}`}
                </h3>
                <p className="text-sky-100 text-sm">
                  {documento?.empresaNombre} {documento?.empresaRnc ? `(RNC: ${documento.empresaRnc})` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                disabled={loading || exportingPdf}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Exportar a PDF"
              >
                {exportingPdf ? (
                  <>
                    <span className="animate-spin">⏳</span> Exportando...
                  </>
                ) : (
                  <>📥 PDF</>
                )}
              </button>
              <button
                onClick={() => handlePrint()}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Imprimir"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando detalle del documento...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Contenido imprimible */}
            <div ref={printRef} className="flex-1 overflow-y-auto print:overflow-visible">
              {/* Estilos de impresión */}
              <style>{`
                @media print {
                  @page {
                    size: letter;
                    margin: 0.5in;
                  }
                  body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  .print\\:hidden {
                    display: none !important;
                  }
                  .print\\:block {
                    display: block !important;
                  }
                  table {
                    page-break-inside: auto;
                  }
                  tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                  }
                  thead {
                    display: table-header-group;
                  }
                }
              `}</style>

              {/* Header para impresión */}
              <div className="hidden print:block p-6 border-b-2 border-gray-300">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">DETALLE DE FACTURA</h1>
                  <p className="text-lg text-gray-700">{documento?.empresaNombre}</p>
                  {documento?.empresaRnc && <p className="text-sm text-gray-500">RNC: {documento.empresaRnc}</p>}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-600">Documento:</p>
                    <p>{documento?.numeroDocumento}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Período:</p>
                    <p>{formatDate(documento?.periodoDesde || "")} - {formatDate(documento?.periodoHasta || "")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Vencimiento:</p>
                    <p>{formatDate(documento?.fechaVencimiento || "")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Total:</p>
                    <p className="font-bold text-lg">{formatCurrency(documento?.montoTotal || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Info del documento (pantalla) */}
              <div className="p-6 border-b border-gray-100 bg-gray-50 print:hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Documento</p>
                    <p className="font-semibold text-gray-900">{documento?.numeroDocumento}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Estado</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ESTADOS_COLOR[documento?.estado || 0]}`}>
                      {ESTADOS[documento?.estado || 0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Período</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(documento?.periodoDesde || "")} - {formatDate(documento?.periodoHasta || "")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Vencimiento</p>
                    <p className="font-medium text-gray-900">{formatDate(documento?.fechaVencimiento || "")}</p>
                  </div>
                </div>

                {/* Montos */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Total Factura</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(documento?.montoTotal || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Pagado</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(documento?.montoPagado || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Pendiente</p>
                    <p className="text-xl font-bold text-amber-600">{formatCurrency(documento?.montoPendiente || 0)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-sm text-gray-600">
                  <span>📝 {documento?.cantidadConsumos || consumos.length} consumos</span>
                  <span>👥 {documento?.cantidadEmpleados || resumenEmpleados.length} empleados</span>
                  <span>🏪 {resumenProveedores.length} proveedores</span>
                </div>
              </div>

              {/* Tabs (solo pantalla) */}
              <div className="border-b border-gray-100 px-6 print:hidden">
                <div className="flex gap-1">
                  {[
                    { key: "consumos", label: "Consumos", icon: "🛒", count: consumos.length },
                    { key: "empleados", label: "Por Empleado", icon: "👥", count: resumenEmpleados.length },
                    { key: "proveedores", label: "Por Proveedor", icon: "🏪", count: resumenProveedores.length },
                    { key: "pagos", label: "Pagos", icon: "💳", count: pagos.length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-sky-600 text-sky-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.icon} {tab.label}
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido de tabs */}
              <div className="p-6">
                {/* TAB: CONSUMOS */}
                {(activeTab === "consumos" ) && (
                  <div className={activeTab !== "consumos" ? "hidden print:block" : ""}>
                    {/* Buscador (solo pantalla) */}
                    <div className="mb-4 print:hidden">
                      <input
                        type="text"
                        placeholder="Buscar por empleado, código, cédula o proveedor..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    {/* Título para impresión */}
                    <h3 className="hidden print:block text-lg font-bold mb-4 mt-6 border-b pb-2">
                      LISTADO DE CONSUMOS ({consumos.length})
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 print:bg-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Fecha</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Código</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Empleado</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600 print:hidden">Cédula</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Grupo</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Proveedor</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600 print:hidden">Tienda</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(busqueda ? consumosFiltrados : consumos).map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                              <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{formatDateTime(c.fecha)}</td>
                              <td className="px-3 py-2 font-mono text-gray-600">{c.clienteCodigo}</td>
                              <td className="px-3 py-2 font-medium text-gray-900">{c.clienteNombre}</td>
                              <td className="px-3 py-2 text-gray-500 print:hidden">{c.clienteCedula || "—"}</td>
                              <td className="px-3 py-2 text-gray-500">{c.clienteGrupo || "—"}</td>
                              <td className="px-3 py-2 text-gray-600">{c.proveedorNombre}</td>
                              <td className="px-3 py-2 text-gray-500 print:hidden">{c.tiendaNombre || "—"}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(c.monto)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 print:bg-gray-200 font-semibold">
                          <tr>
                            <td colSpan={5} className="px-3 py-3 text-right text-gray-700 print:hidden">TOTAL:</td>
                            <td colSpan={4} className="px-3 py-3 text-right text-gray-700 hidden print:table-cell">TOTAL:</td>
                            <td className="px-3 py-3 text-right font-bold text-sky-700 text-lg">
                              {formatCurrency((busqueda ? consumosFiltrados : consumos).reduce((sum, c) => sum + c.monto, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {consumosFiltrados.length === 0 && busqueda && (
                      <div className="text-center py-8 text-gray-500 print:hidden">
                        No se encontraron consumos que coincidan con "{busqueda}"
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: POR EMPLEADO */}
                {activeTab === "empleados" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-bold mb-4 border-b pb-2">RESUMEN POR EMPLEADO</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Código</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Empleado</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Grupo</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600">Consumos</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resumenEmpleados.map((e) => (
                            <tr key={e.clienteId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-gray-600">{e.codigo}</td>
                              <td className="px-3 py-2 font-medium text-gray-900">{e.nombre}</td>
                              <td className="px-3 py-2 text-gray-500">{e.grupo || "—"}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{e.totalConsumos}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(e.montoTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-semibold">
                          <tr>
                            <td colSpan={3} className="px-3 py-3 text-right text-gray-700">TOTALES:</td>
                            <td className="px-3 py-3 text-center font-bold text-gray-700">
                              {resumenEmpleados.reduce((sum, e) => sum + e.totalConsumos, 0)}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-sky-700 text-lg">
                              {formatCurrency(resumenEmpleados.reduce((sum, e) => sum + e.montoTotal, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: POR PROVEEDOR */}
                {activeTab === "proveedores" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-bold mb-4 border-b pb-2">RESUMEN POR PROVEEDOR</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Proveedor</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600">Consumos</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resumenProveedores.map((p) => (
                            <tr key={p.proveedorId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{p.proveedorNombre}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{p.totalConsumos}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(p.montoTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-semibold">
                          <tr>
                            <td className="px-3 py-3 text-right text-gray-700">TOTALES:</td>
                            <td className="px-3 py-3 text-center font-bold text-gray-700">
                              {resumenProveedores.reduce((sum, p) => sum + p.totalConsumos, 0)}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-sky-700 text-lg">
                              {formatCurrency(resumenProveedores.reduce((sum, p) => sum + p.montoTotal, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: PAGOS */}
                {activeTab === "pagos" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-bold mb-4 border-b pb-2">HISTORIAL DE PAGOS</h3>
                    {pagos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-3xl block mb-2">💳</span>
                        No hay pagos registrados para este documento
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Recibo</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Fecha</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Método</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Referencia</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-600">Banco</th>
                              <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {pagos.map((p) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono text-gray-900">{p.numeroRecibo}</td>
                                <td className="px-3 py-2 text-gray-600">{formatDateTime(p.fecha)}</td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {METODOS_PAGO[p.metodoPago] || "Otro"}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-500">{p.referencia || "—"}</td>
                                <td className="px-3 py-2 text-gray-500">{p.banco || "—"}</td>
                                <td className="px-3 py-2 text-right font-semibold text-green-600">{formatCurrency(p.monto)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 font-semibold">
                            <tr>
                              <td colSpan={5} className="px-3 py-3 text-right text-gray-700">TOTAL PAGADO:</td>
                              <td className="px-3 py-3 text-right font-bold text-green-700 text-lg">
                                {formatCurrency(pagos.reduce((sum, p) => sum + p.monto, 0))}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pie para impresión */}
              <div className="hidden print:block p-4 border-t-2 border-gray-300 mt-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Documento: {documento?.numeroDocumento}</span>
                  <span>Generado el {new Date().toLocaleString("es-DO")}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
