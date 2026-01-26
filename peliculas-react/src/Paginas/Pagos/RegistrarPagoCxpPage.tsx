/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/CxP/RegistrarPagoCxpPage.tsx
// Página para registrar pago a un documento CxP

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../Servicios/api";


type Documento = {
  id: number;
  numeroDocumento: string;
  proveedor: { id: number; nombre: string; rnc: string; porcentajeComision: number };
  periodoDesde: string;
  periodoHasta: string;
  montoBruto: number;
  montoComision: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
};

const METODOS_PAGO = [
  { value: 0, label: "Efectivo" },
  { value: 1, label: "Transferencia" },
  { value: 2, label: "Cheque" },
  { value: 3, label: "Tarjeta de Crédito" },
  { value: 4, label: "Tarjeta de Débito" },
  { value: 5, label: "Otro" }
];

export default function RegistrarPagoCxpPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formulario
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState(1);
  const [referencia, setReferencia] = useState("");
  const [bancoOrigen, setBancoOrigen] = useState("");
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (id) loadDocumento();
  }, [id]);

  const loadDocumento = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cxp/documentos/${id}`);
      setDocumento(res.data);
      setMonto(res.data.montoPendiente.toString());
    } catch (error) {
      console.error("Error cargando documento:", error);
      setError("Error cargando documento");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento) return;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    if (montoNum > documento.montoPendiente) {
      setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(documento.montoPendiente)})`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await api.post(`/cxp/documentos/${id}/pagos`, {
        monto: montoNum,
        metodoPago,
        referencia: referencia || null,
        bancoOrigen: bancoOrigen || null,
        cuentaDestino: cuentaDestino || null,
        notas: notas || null
      });

      setSuccess(res.data.mensaje);
      
      setTimeout(() => {
        navigate(`/pagos/cxp/documentos/${id}`);
      }, 2000);

    } catch (error: any) {
      setError(error.response?.data?.message || "Error registrando pago");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700">Documento no encontrado</p>
          <Link to="/pagos/cxp" className="text-sky-600 hover:underline mt-2 inline-block">
            Volver a CxP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/cxp" className="text-gray-400 hover:text-gray-600">CxP</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Registrar Pago</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">💳 Registrar Pago a Proveedor</h1>
      </div>

      {/* Info del documento */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-amber-700">Documento</p>
            <p className="text-xl font-bold text-amber-900">{documento.numeroDocumento}</p>
            <p className="text-amber-700 mt-1">{documento.proveedor.nombre}</p>
            <p className="text-sm text-amber-600">
              Período: {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-700">Por Pagar</p>
            <p className="text-3xl font-bold text-amber-900">{formatCurrency(documento.montoPendiente)}</p>
          </div>
        </div>

        {/* Desglose */}
        <div className="mt-4 pt-4 border-t border-amber-200 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-amber-600">Bruto</p>
            <p className="font-semibold text-amber-900">{formatCurrency(documento.montoBruto)}</p>
          </div>
          <div>
            <p className="text-green-600">Tu Comisión</p>
            <p className="font-semibold text-green-700">{formatCurrency(documento.montoComision)}</p>
          </div>
          <div>
            <p className="text-amber-600">Neto a Pagar</p>
            <p className="font-semibold text-amber-900">{formatCurrency(documento.montoTotal)}</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="font-semibold text-gray-900 text-lg">Datos del Pago</h2>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Pagar *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">RD$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={documento.montoPendiente}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-xl font-semibold"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Máximo: {formatCurrency(documento.montoPendiente)}
          </p>
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
          >
            {METODOS_PAGO.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Referencia, Banco y Cuenta (condicional) */}
        {metodoPago !== 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {metodoPago === 2 ? "Número de Cheque" : "Referencia/Confirmación"}
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder={metodoPago === 2 ? "Ej: 001234" : "Ej: TRF-12345"}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banco Origen</label>
                <input
                  type="text"
                  value={bancoOrigen}
                  onChange={(e) => setBancoOrigen(e.target.value)}
                  placeholder="Ej: Banco Popular"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta Destino (Proveedor)</label>
              <input
                type="text"
                value={cuentaDestino}
                onChange={(e) => setCuentaDestino(e.target.value)}
                placeholder="Ej: 123-456789-0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Observaciones adicionales..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            ✅ {success}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !!success}
            className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-semibold disabled:opacity-50"
          >
            {saving ? "Registrando..." : `Registrar Pago ${monto ? formatCurrency(parseFloat(monto) || 0) : ""}`}
          </button>
        </div>
      </form>

      {/* Info adicional */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-sm text-green-800">
          <strong>💰 Recuerda:</strong> Tu comisión de {formatCurrency(documento.montoComision)} 
          ({documento.proveedor.porcentajeComision}%) ya está descontada del monto a pagar.
        </p>
      </div>
    </div>
  );
}