/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Componentes/Documentos/DocumentoCxpDetalleModal.tsx
// Modal para ver el detalle de un documento CxP con sus consumos

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
  numeroFacturaProveedor: string | null;
  tipo: number;
  fechaEmision: string;
  fechaVencimiento: string;
  periodoDesde: string | null;
  periodoHasta: string | null;
  montoBruto: number;
  montoComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  cantidadConsumos: number;
  concepto: string | null;
  notas: string | null;
  anulado: boolean;
  proveedorId: number;
  proveedorNombre: string;
  proveedorRnc: string | null;
  proveedorTelefono: string | null;
  proveedorEmail: string | null;
  proveedorDireccion: string | null;
  porcentajeComision: number;
  creadoPor: string | null;
  creadoUtc: string;
};

type Consumo = {
  id: number;
  fecha: string;
  monto: number;
  montoNetoProveedor: number;
  montoComision: number;
  nota: string | null;
  clienteCodigo: string;
  clienteNombre: string;
  empresaNombre: string;
  tiendaNombre: string | null;
  cajaNombre: string | null;
  registradoPor: string | null;
};

type ResumenEmpresa = {
  empresaId: number;
  empresaNombre: string;
  empresaRnc: string | null;
  totalConsumos: number;
  montoBruto: number;
  montoNeto: number;
  montoComision: number;
};

type ResumenTienda = {
  tiendaId: number;
  tiendaNombre: string;
  totalConsumos: number;
  montoBruto: number;
  montoNeto: number;
};

/* type Pago = {
  id: number;
  numeroTransaccion: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  referencia: string | null;
  banco: string | null;
}; */

type Pago = {
  id: number;
  numeroComprobante: string;  // Cambiado de numeroTransaccion
  fecha: string;
  monto: number;
  metodoPago: number;
  referencia: string | null;
  bancoOrigen: string | null;  // Cambiado de banco
  cuentaDestino: string | null;  // Nuevo
  notas: string | null;
  registradoPor: string | null;
};

const ESTADOS = ["Pendiente", "Parcial", "Pagado"];
const ESTADOS_COLOR = ["bg-amber-100 text-amber-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700"];
const METODOS_PAGO = ["Efectivo", "Transferencia", "Cheque", "Tarjeta Crédito", "Tarjeta Débito", "Otro"];

export default function DocumentoCxpDetalleModal({ open, documentoId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [resumenEmpresas, setResumenEmpresas] = useState<ResumenEmpresa[]>([]);
  const [resumenTiendas, setResumenTiendas] = useState<ResumenTienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [activeTab, setActiveTab] = useState<"consumos" | "empresas" | "tiendas" | "pagos">("consumos");
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
      const res = await api.get(`/documentos/cxp/${documentoId}`);
      setDocumento(res.data.documento);
      setConsumos(res.data.consumos || []);
      setResumenEmpresas(res.data.resumenEmpresas || []);
      setResumenTiendas(res.data.resumenTiendas || []);
      setPagos(res.data.pagos || []);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Documento_CxP_${documento?.numeroDocumento || "detalle"}`
  });

  const formatCurrency = (value: number) =>
    `RD$${(value || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("es-DO") : "—";

  const formatDateTime = (date: string) =>
    date ? new Date(date).toLocaleString("es-DO") : "—";

  const consumosFiltrados = consumos.filter(c =>
    c.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.clienteCodigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.empresaNombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {loading ? "Cargando..." : `Documento ${documento?.numeroDocumento}`}
                </h3>
                <p className="text-teal-100 text-sm">
                  {documento?.proveedorNombre} {documento?.proveedorRnc ? `(${documento.proveedorRnc})` : ""}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando detalle del documento...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Contenido imprimible */}
            <div ref={printRef} className="flex-1 overflow-y-auto">
              {/* Info del documento */}
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                {/* Header para impresión */}
                <div className="hidden print:block text-center mb-6">
                  <h1 className="text-2xl font-bold">Detalle de Documento CxP</h1>
                  <p className="text-gray-600">{documento?.proveedorNombre}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Documento</p>
                    <p className="font-semibold text-gray-900">{documento?.numeroDocumento}</p>
                    {documento?.numeroFacturaProveedor && (
                      <p className="text-xs text-gray-500">Fact. Prov: {documento.numeroFacturaProveedor}</p>
                    )}
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
                      {formatDate(documento?.periodoDesde || null)} - {formatDate(documento?.periodoHasta || null)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Vencimiento</p>
                    <p className="font-medium text-gray-900">{formatDate(documento?.fechaVencimiento || "")}</p>
                  </div>
                </div>

                {/* Montos */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Monto Bruto</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(documento?.montoBruto || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Comision ({documento?.porcentajeComision}%)</p>
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(documento?.montoComision || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Total a Pagar</p>
                    <p className="text-lg font-bold text-teal-700">{formatCurrency(documento?.montoTotal || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Pagado</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(documento?.montoPagado || 0)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Pendiente</p>
                    <p className="text-lg font-bold text-amber-600">{formatCurrency(documento?.montoPendiente || 0)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-sm text-gray-600">
                  <span>📝 {documento?.cantidadConsumos} consumos</span>
                  <span>🏢 {resumenEmpresas.length} empresas</span>
                  <span>🏪 {resumenTiendas.length} tiendas</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100 px-6 print:hidden">
                <div className="flex gap-1">
                  {[
                    { key: "consumos", label: "Consumos", icon: "🛒", count: consumos.length },
                    { key: "empresas", label: "Por Empresa", icon: "🏢", count: resumenEmpresas.length },
                    { key: "tiendas", label: "Por Tienda", icon: "🏪", count: resumenTiendas.length },
                    { key: "pagos", label: "Pagos", icon: "💳", count: pagos.length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-teal-600 text-teal-600"
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
                {activeTab === "consumos" && (
                  <div>
                    {/* Buscador */}
                    <div className="mb-4 print:hidden">
                      <input
                        type="text"
                        placeholder="Buscar por cliente, codigo o empresa..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>

                    {/* Titulo para impresión */}
                    <h3 className="hidden print:block text-lg font-semibold mb-4">Listado de Consumos</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Fecha</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Cliente</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Empresa</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Tienda</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Bruto</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Comision</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Neto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {consumosFiltrados.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-600">{formatDateTime(c.fecha)}</td>
                              <td className="px-3 py-2">
                                <p className="font-medium text-gray-900">{c.clienteNombre}</p>
                                <p className="text-xs text-gray-500">{c.clienteCodigo}</p>
                              </td>
                              <td className="px-3 py-2 text-gray-600">{c.empresaNombre}</td>
                              <td className="px-3 py-2 text-gray-500">{c.tiendaNombre || "—"}</td>
                              <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(c.monto)}</td>
                              <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(c.montoComision)}</td>
                              <td className="px-3 py-2 text-right font-semibold text-teal-700">{formatCurrency(c.montoNetoProveedor)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={4} className="px-3 py-2 text-right font-semibold text-gray-700">TOTALES:</td>
                            <td className="px-3 py-2 text-right font-bold text-gray-700">
                              {formatCurrency(consumosFiltrados.reduce((sum, c) => sum + c.monto, 0))}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-red-600">
                              -{formatCurrency(consumosFiltrados.reduce((sum, c) => sum + c.montoComision, 0))}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-teal-700">
                              {formatCurrency(consumosFiltrados.reduce((sum, c) => sum + c.montoNetoProveedor, 0))}
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

                {/* TAB: POR EMPRESA */}
                {activeTab === "empresas" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-semibold mb-4">Resumen por Empresa</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Empresa</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">RNC</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600">Consumos</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Bruto</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Comision</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Neto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resumenEmpresas.map((e) => (
                            <tr key={e.empresaId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{e.empresaNombre}</td>
                              <td className="px-3 py-2 text-gray-500">{e.empresaRnc || "—"}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{e.totalConsumos}</td>
                              <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(e.montoBruto)}</td>
                              <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(e.montoComision)}</td>
                              <td className="px-3 py-2 text-right font-semibold text-teal-700">{formatCurrency(e.montoNeto)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={2} className="px-3 py-2 text-right font-semibold text-gray-700">TOTALES:</td>
                            <td className="px-3 py-2 text-center font-bold text-gray-700">
                              {resumenEmpresas.reduce((sum, e) => sum + e.totalConsumos, 0)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-gray-700">
                              {formatCurrency(resumenEmpresas.reduce((sum, e) => sum + e.montoBruto, 0))}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-red-600">
                              -{formatCurrency(resumenEmpresas.reduce((sum, e) => sum + e.montoComision, 0))}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-teal-700">
                              {formatCurrency(resumenEmpresas.reduce((sum, e) => sum + e.montoNeto, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: POR TIENDA */}
                {activeTab === "tiendas" && (
                  <div>
                    <h3 className="hidden print:block text-lg font-semibold mb-4">Resumen por Tienda</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Tienda</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-600">Consumos</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto Bruto</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Monto Neto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resumenTiendas.map((t) => (
                            <tr key={t.tiendaId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{t.tiendaNombre}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{t.totalConsumos}</td>
                              <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(t.montoBruto)}</td>
                              <td className="px-3 py-2 text-right font-semibold text-teal-700">{formatCurrency(t.montoNeto)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="px-3 py-2 text-right font-semibold text-gray-700">TOTALES:</td>
                            <td className="px-3 py-2 text-center font-bold text-gray-700">
                              {resumenTiendas.reduce((sum, t) => sum + t.totalConsumos, 0)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-gray-700">
                              {formatCurrency(resumenTiendas.reduce((sum, t) => sum + t.montoBruto, 0))}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-teal-700">
                              {formatCurrency(resumenTiendas.reduce((sum, t) => sum + t.montoNeto, 0))}
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
              <th className="px-3 py-2 text-left font-semibold text-gray-600">Comprobante</th>
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
                <td className="px-3 py-2 font-mono text-gray-900">{p.numeroComprobante}</td>
                <td className="px-3 py-2 text-gray-600">{formatDateTime(p.fecha)}</td>
                <td className="px-3 py-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {METODOS_PAGO[p.metodoPago] || "Otro"}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500">{p.referencia || "—"}</td>
                <td className="px-3 py-2 text-gray-500">{p.bancoOrigen || "—"}</td>
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

              

              {/* Pie para impresión */}
              <div className="hidden print:block p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                Generado el {new Date().toLocaleString("es-DO")}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}