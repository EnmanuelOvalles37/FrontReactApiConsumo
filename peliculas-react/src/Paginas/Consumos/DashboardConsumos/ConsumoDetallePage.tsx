// src/Paginas/Consumos/ConsumoDetallePage.tsx
// Detalle de un consumo con opción de reversar e impresión de comprobante

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
//import api from "../../Servicios/api";
//import ModalImpresion from "../../Componentes/Comprobantes/ModalImpresion";
//import { type DatosComprobante } from "../../Componentes/Comprobantes/ComprobanteTicket";
import api from "../../../Servicios/api";
import { ModalImpresion, type DatosComprobante } from "../../../Componentes/Comprobantes";

interface ConsumoDetalle {
  id: number;
  fecha: string;
  cliente: {
    id: number;
    nombre: string;
    cedula: string | null;
    saldoActual: number;
    limite: number;
  };
  empresa: {
    id: number;
    nombre: string;
    rnc: string | null;
  };
  proveedor: {
    id: number;
    nombre: string;
  };
  tiendaId: number | null;
  tiendaNombre: string | null;
  cajaId: number | null;
  cajaNombre: string | null;
  monto: number;
  concepto: string | null;
  nota: string | null;
  referencia: string | null;
  reversado: boolean;
  reversadoUtc: string | null;
  reversadoPor: string | null;
  motivoReverso: string | null;
  registradoPor: string | null;
  puedeReversarse: boolean;
  horasParaReversar: number;
}

export default function ConsumoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consumo, setConsumo] = useState<ConsumoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal reversar
  const [showModalReversar, setShowModalReversar] = useState(false);
  const [motivoReverso, setMotivoReverso] = useState("");
  const [reversando, setReversando] = useState(false);

  // ==========================================
  // ESTADOS PARA MODAL DE IMPRESIÓN
  // ==========================================
  const [modalImpresionOpen, setModalImpresionOpen] = useState(false);
  const [datosComprobante, setDatosComprobante] = useState<DatosComprobante | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/modulo-consumos/${id}`);
      setConsumo(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al cargar el consumo");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REVERSAR CON MODAL DE IMPRESIÓN
  // ==========================================
  const handleReversar = async () => {
    if (!consumo) return;
    
    setReversando(true);
    try {
      await api.post(`/modulo-consumos/${consumo.id}/reversar`, {
        motivo: motivoReverso || null
      });
      
      setShowModalReversar(false);

      // Preparar datos para comprobante de reverso
      const datosReverso: DatosComprobante = {
        tipo: "REVERSO",
        id: consumo.id,
        fecha: new Date().toISOString(),
        monto: consumo.monto,
        concepto: consumo.concepto || null,
        referencia: consumo.referencia || null,
        
        clienteNombre: consumo.cliente.nombre,
        clienteCedula: consumo.cliente.cedula || null,
        
        empresaNombre: consumo.empresa.nombre,
        empresaRnc: consumo.empresa.rnc || null,
        
        proveedorNombre: consumo.proveedor.nombre,
        tiendaNombre: consumo.tiendaNombre || null,
        cajaNombre: consumo.cajaNombre || null,
        
        cajeroNombre: localStorage.getItem("userName") || null,
        motivoReverso: motivoReverso || "Solicitud del cliente",
      };

      setDatosComprobante(datosReverso);
      setModalImpresionOpen(true);

    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Error al reversar el consumo");
    } finally {
      setReversando(false);
    }
  };

  // ==========================================
  // CALLBACK CUANDO SE CIERRA EL MODAL
  // ==========================================
  const handleImpresionCompleta = () => {
    setModalImpresionOpen(false);
    setDatosComprobante(null);
    setMotivoReverso("");
    // Recargar datos después de reversar
    loadData();
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-DO");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando...</div>
      </div>
    );
  }

  if (error || !consumo) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error || "Consumo no encontrado"}
        </div>
        <Link to="/modulo-consumos/lista" className="mt-4 inline-block text-sky-600 hover:underline">
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <Link to="/modulo-consumos/lista" className="hover:text-gray-700">Lista</Link>
          <span>→</span>
          <span className="text-gray-900">#{consumo.id}</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Consumo #{consumo.id}
              {consumo.reversado && (
                <span className="ml-3 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                  REVERSADO
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{formatDateTime(consumo.fecha)}</p>
          </div>
          {consumo.puedeReversarse && (
            <button
              onClick={() => setShowModalReversar(true)}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              ↩️ Reversar Consumo
            </button>
          )}
        </div>
      </div>

      {/* Alerta de tiempo para reversar */}
      {!consumo.reversado && consumo.puedeReversarse && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-800">
            ⏱️ Tiempo restante para reversar: <strong>{Math.floor(consumo.horasParaReversar)}h {Math.floor((consumo.horasParaReversar % 1) * 60)}m</strong>
          </p>
          <p className="text-sm text-amber-600 mt-1">
            Los consumos solo pueden reversarse dentro de las primeras 24 horas.
          </p>
        </div>
      )}

      {/* Info de reverso */}
      {consumo.reversado && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-medium">Este consumo fue reversado</p>
          <div className="mt-2 text-sm text-red-700 space-y-1">
            <p>📅 Fecha: {consumo.reversadoUtc ? formatDateTime(consumo.reversadoUtc) : "N/A"}</p>
            <p>👤 Por: {consumo.reversadoPor || "N/A"}</p>
            {consumo.motivoReverso && <p>📝 Motivo: {consumo.motivoReverso}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del consumo */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Información del Consumo</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Monto</span>
              <span className={`text-xl font-bold ${consumo.reversado ? 'text-red-500 line-through' : 'text-green-700'}`}>
                {formatCurrency(consumo.monto)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Concepto</span>
              <span className="text-gray-900">{consumo.concepto || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Referencia</span>
              <span className="text-gray-900">{consumo.referencia || "-"}</span>
            </div>
            {consumo.nota && (
              <div className="py-2 border-b">
                <span className="text-gray-500 block mb-1">Nota</span>
                <span className="text-gray-900">{consumo.nota}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Registrado por</span>
              <span className="text-gray-900">{consumo.registradoPor || "-"}</span>
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Cliente</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Nombre</span>
              <Link to={`/clientes/editar/${consumo.cliente.id}`} className="text-sky-600 hover:underline">
                {consumo.cliente.nombre}
              </Link>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Cédula</span>
              <span className="text-gray-900">{consumo.cliente.cedula || "-"}</span>
            </div>
            {/*<div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Saldo Actual</span>
              <span className="text-green-700 font-medium">{formatCurrency(consumo.cliente.saldoActual)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Límite de Crédito</span>
              <span className="text-gray-900">{formatCurrency(consumo.cliente.limite)}</span>
            </div>*/}
          </div>

          {/* Barra de uso }
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Uso del crédito</span>
              <span className="text-gray-700">
                {((1 - consumo.cliente.saldoActual / consumo.cliente.limite) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${Math.min(100, (1 - consumo.cliente.saldoActual / consumo.cliente.limite) * 100)}%` }}
              />
            </div>
          </div> */}
        </div>

        {/* Empresa */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Empresa</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Nombre</span>
              <Link to={`/empresas/${consumo.empresa.id}`} className="text-sky-600 hover:underline">
                {consumo.empresa.nombre}
              </Link>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">RNC</span>
              <span className="text-gray-900">{consumo.empresa.rnc || "-"}</span>
            </div>
          </div>
        </div>

        {/* Proveedor */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Proveedor / Punto de Venta</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Proveedor</span>
              <Link to={`/proveedores/${consumo.proveedor.id}`} className="text-sky-600 hover:underline">
                {consumo.proveedor.nombre}
              </Link>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Tienda</span>
              <span className="text-gray-900">{consumo.tiendaNombre || "-"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Caja</span>
              <span className="text-gray-900">{consumo.cajaNombre || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón volver */}
      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl border hover:bg-gray-50"
        >
          ← Volver
        </button>
      </div>

      {/* Modal Reversar */}
      {showModalReversar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ↩️ Reversar Consumo
            </h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-amber-800 text-sm">
                ⚠️ Esta acción devolverá <strong>{formatCurrency(consumo.monto)}</strong> al saldo del cliente <strong>{consumo.cliente.nombre}</strong>.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo del reverso (opcional)
              </label>
              <textarea
                value={motivoReverso}
                onChange={(e) => setMotivoReverso(e.target.value)}
                rows={3}
                placeholder="Ej: Error en el monto, cliente equivocado..."
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModalReversar(false)}
                disabled={reversando}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReversar}
                disabled={reversando}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {reversando ? "Reversando..." : "Confirmar Reverso"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE IMPRESIÓN - PARA REVERSOS
          ========================================== */}
      <ModalImpresion
        open={modalImpresionOpen}
        datos={datosComprobante}
        onClose={() => setModalImpresionOpen(false)}
        onImpreso={handleImpresionCompleta}
      />
    </div>
  );
}