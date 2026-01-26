/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/RegistrarCobroPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cobrosApi, METODOS_PAGO /*, type CxcDocumentoDetalle */ } from "../../Servicios/pagosApi";

// Usa tu tipo real en lugar de "any" si lo tienes
type DocumentoType = any;

export default function RegistrarCobroPage() {
  const { documentoId } = useParams<{ documentoId?: string }>();
  const navigate = useNavigate();

  const [documento, setDocumento] = useState<DocumentoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState(1); // Transferencia por defecto
  const [referencia, setReferencia] = useState("");
  const [banco, setBanco] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (documentoId) {
      loadDocumento(parseInt(documentoId, 10));
    }
  }, [documentoId]);

  // Helper para leer keys con distinto casing
  const get = (obj: any, ...keys: string[]) => {
    for (const k of keys) {
      if (obj == null) continue;
      if (k in obj) return obj[k];
    }
    return undefined;
  };

  const normalizeDocumento = (raw: any) => {
    if (!raw) return null;
    const normalized: any = {
      id: get(raw, "id", "Id"),
      numeroDocumento: get(raw, "numeroDocumento", "NumeroDocumento") ?? get(raw, "numero_documento"),
      empresaId: get(raw, "empresaId", "EmpresaId"),
      empresaNombre:
        get(raw, "empresaNombre", "EmpresaNombre") ??
        get(raw, "empresa", "Empresa")?.nombre ??
        get(raw, "empresa", "Empresa")?.Nombre,
      empresaRnc:
        get(raw, "empresaRnc", "EmpresaRnc") ??
        get(raw, "empresa", "Empresa")?.rnc,
      periodoDesde: get(raw, "periodoDesde", "PeriodoDesde"),
      periodoHasta: get(raw, "periodoHasta", "PeriodoHasta"),
      fechaVencimiento: get(raw, "fechaVencimiento", "FechaVencimiento"),
      estadoNombre: get(raw, "estadoNombre", "EstadoNombre") ?? get(raw, "estado", "Estado"),
      refinanciado: Boolean(get(raw, "refinanciado", "Refinanciado") ?? false),
      refinanciamiento: get(raw, "refinanciamiento", "Refinanciamiento") ?? null,
      notas: get(raw, "notas", "Notas") ?? null,
      // números: utilizan Number(...) con fallback 0
      montoTotal: Number(get(raw, "montoTotal", "MontoTotal") ?? 0),
      montoPagado: Number(get(raw, "montoPagado", "MontoPagado") ?? 0),
      montoPendiente: Number(get(raw, "montoPendiente", "MontoPendiente") ?? 0),
      // arrays (asegurar que existan)
      consumos: get(raw, "consumos", "Consumos") ?? [],
      pagos: get(raw, "pagos", "Pagos") ?? [],
    };

    // Normalizar elementos de pagos (asegurar campos usados)
    normalized.pagos = (normalized.pagos ?? []).map((p: any) => ({
      id: p.id ?? p.Id,
      fecha: p.fecha ?? p.Fecha,
      numeroRecibo: p.numeroRecibo ?? p.NumeroRecibo ?? p.numero ?? null,
      metodoPagoNombre: (p.metodoPagoNombre ?? p.MetodoPagoNombre ?? p.metodo) || "",
      monto: Number(p.monto ?? p.Monto ?? 0),
      referencia: p.referencia ?? p.Referencia ?? null,
      banco: p.banco ?? p.Banco ?? null,
    }));

    // Normalizar consumos mínimo (si lo usas)
    normalized.consumos = (normalized.consumos ?? []).map((c: any) => ({
      id: c.id ?? c.Id,
      fecha: c.fecha ?? c.Fecha,
      clienteNombre: c.clienteNombre ?? c.ClienteNombre ?? c.nombreCliente ?? c.Cliente?.nombre,
      clienteCedula: c.clienteCedula ?? c.ClienteCedula ?? c.cedula ?? c.Cliente?.cedula,
      monto: Number(c.monto ?? c.Monto ?? 0),
    }));

    return normalized;
  };

  const loadDocumento = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const dataRaw = await cobrosApi.obtenerDocumento(id);
      const data = normalizeDocumento(dataRaw);
      setDocumento(data);

      // Pre-llenar con monto pendiente de forma segura
      const pendiente = Number(data?.montoPendiente ?? 0);
      setMonto(String(pendiente));
    } catch (err) {
      console.error("Error cargando documento:", err);
      setError("No se pudo cargar el documento");
      setDocumento(null);
      setMonto("");
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

    if (documento && montoNum > Number(documento.montoPendiente ?? 0)) {
      setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(Number(documento.montoPendiente ?? 0))})`);
      return;
    }

    setSaving(true);
    try {
      const result = await cobrosApi.registrarPago({
        cxcDocumentoId: parseInt(documentoId ?? "0", 10),
        monto: montoNum,
        metodoPago,
        referencia: referencia || undefined,
        banco: banco || undefined,
        notas: notas || undefined,
      });

      alert(`Cobro registrado exitosamente.\nRecibo: ${result.numeroRecibo}`);
      navigate(`/pagos/cobros/documento/${documentoId}`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || "Error al registrar el cobro");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    const v = Number(value ?? 0);
    // Aseguramos que v sea número antes de llamar a toLocaleString
    return `RD$${v.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-DO");
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
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error || "Documento no encontrado"}</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-xl border hover:bg-gray-50">
          Volver
        </button>
      </div>
    );
  }

  // seguridad extra: garantizar arrays
  const pagos = documento.pagos ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Volver
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Registrar Cobro</h1>
        <p className="text-sm text-gray-500 mt-1">Documento: {documento.numeroDocumento}</p>
      </div>

      {/* Info del documento */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Información del Documento</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Empresa</p>
            <p className="font-medium">{documento.empresaNombre}</p>
            <p className="text-xs text-gray-400">{documento.empresaRnc}</p>
          </div>
          <div>
            <p className="text-gray-500">Período</p>
            <p className="font-medium">
              {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Fecha Vencimiento</p>
            <p className={`font-medium ${new Date(documento.fechaVencimiento) < new Date() ? "text-red-600" : ""}`}>
              {formatDate(documento.fechaVencimiento)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Estado</p>
            <p className="font-medium">{documento.estadoNombre}</p>
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
        <h2 className="font-semibold text-gray-900 mb-4">Datos del Cobro</h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

        <div className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Cobrar *</label>
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
            <p className="mt-1 text-xs text-gray-500">Máximo: {formatCurrency(documento.montoPendiente)}</p>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(parseInt(e.target.value, 10))}
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

          {/* ... otros campos (referencia, banco, notas) - sin cambios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Referencia</label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Número de transferencia, cheque, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
            <input
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Nombre del banco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
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
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border hover:bg-gray-50" disabled={saving}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Registrando..." : "Registrar Cobro"}
          </button>
        </div>
      </form>

      {/* Historial de pagos */}
      {(pagos ?? []).length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Pagos Anteriores</h2>
          <div className="space-y-3">
            {pagos.map((pago: any) => (
              <div key={pago.id ?? `${pago.numeroRecibo}-${pago.fecha}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">{pago.numeroRecibo}</p>
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
