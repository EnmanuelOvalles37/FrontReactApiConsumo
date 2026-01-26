// src/Paginas/Pagos/RegistrarPagoProveedorPage.tsx
// Página para registrar un pago a proveedor

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pagosProveedorApi, METODOS_PAGO, type CxpDocumentoListItem, type CxpPagoItem, type ConsumoItem } from "../../Servicios/pagosApi";

interface DocumentoDetalle extends CxpDocumentoListItem {
  proveedor: { id: number; nombre: string; rnc: string };
  pagos: CxpPagoItem[];
  consumos: ConsumoItem[];
}

export default function RegistrarPagoProveedorPage() {
  const { documentoId } = useParams<{ documentoId: string }>();
  const navigate = useNavigate();

  const [documento, setDocumento] = useState<DocumentoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState(1); // Transferencia por defecto
  const [referencia, setReferencia] = useState("");
  const [bancoOrigen, setBancoOrigen] = useState("");
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (documentoId) {
      loadDocumento(parseInt(documentoId));
    }
  }, [documentoId]);

  const loadDocumento = async (id: number) => {
    setLoading(true);
    try {
      const data = await pagosProveedorApi.obtenerDocumento(id);
      setDocumento(data as DocumentoDetalle);
      setMonto(data.montoPendiente.toString());
    } catch (err) {
      console.error("Error cargando documento:", err);
      setError("No se pudo cargar el documento");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingrese un monto válido");
      return;
    }

    if (documento && montoNum > documento.montoPendiente) {
      setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(documento.montoPendiente)})`);
      return;
    }

    setSaving(true);
    try {
      const result = await pagosProveedorApi.registrarPago({
        cxpDocumentoId: parseInt(documentoId!),
        monto: montoNum,
        metodoPago,
        referencia: referencia || undefined,
        bancoOrigen: bancoOrigen || undefined,
        cuentaDestino: cuentaDestino || undefined,
        notas: notas || undefined,
      });

      alert(`Pago registrado exitosamente.\nComprobante: ${result.numeroComprobante}`);
      navigate(`/pagos/proveedores/documento/${documentoId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al registrar el pago");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-DO");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando documento...</div>
      </div>
    );
  }

  if (!documento) {
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Registrar Pago a Proveedor</h1>
        <p className="text-sm text-gray-500 mt-1">Documento: {documento.numeroDocumento}</p>
      </div>

      {/* Info del documento */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Información del Documento</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Proveedor</p>
            <p className="font-medium">{documento.proveedor.nombre}</p>
            <p className="text-xs text-gray-400">{documento.proveedor.rnc}</p>
          </div>
          <div>
            <p className="text-gray-500">Factura Proveedor</p>
            <p className="font-medium">{documento.numeroFacturaProveedor || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Fecha Vencimiento</p>
            <p className={`font-medium ${new Date(documento.fechaVencimiento) < new Date() ? "text-red-600" : ""}`}>
              {formatDate(documento.fechaVencimiento)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Concepto</p>
            <p className="font-medium">{documento.concepto || "—"}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-bold">{formatCurrency(documento.montoTotal)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Pagado</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(documento.montoPagado)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Pendiente</p>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(documento.montoPendiente)}</p>
          </div>
        </div>
      </div>

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Datos del Pago</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Pagar *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RD$</span>
              <input
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="0.00"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Máximo: {formatCurrency(documento.montoPendiente)}
            </p>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago *
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            >
              {METODOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Banco Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco Origen
              </label>
              <input
                type="text"
                value={bancoOrigen}
                onChange={(e) => setBancoOrigen(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Banco emisor"
              />
            </div>

            {/* Cuenta Destino */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuenta Destino
              </label>
              <input
                type="text"
                value={cuentaDestino}
                onChange={(e) => setCuentaDestino(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Cuenta del proveedor"
              />
            </div>
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Referencia
            </label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Número de transferencia, cheque, etc."
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Registrando..." : "Registrar Pago"}
          </button>
        </div>
      </form>

      {/* Historial de pagos */}
      {documento.pagos && documento.pagos.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Pagos Anteriores</h2>
          <div className="space-y-3">
            {documento.pagos.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">{pago.numeroComprobante}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(pago.fecha)} • {pago.metodoPagoNombre}
                    {pago.referencia && ` • Ref: ${pago.referencia}`}
                  </p>
                </div>
                <p className="font-bold text-green-600">{formatCurrency(pago.monto)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}