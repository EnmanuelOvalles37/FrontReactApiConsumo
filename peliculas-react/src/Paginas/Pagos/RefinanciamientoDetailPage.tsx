/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/RefinanciamientoDetailPage.tsx
// Página de detalle de un refinanciamiento

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { refinanciamientoApi, METODOS_PAGO } from "../../Servicios/pagosApi";

/* Interfaces (mantuve tu RefinanciamientoDetalle original) */
interface RefinanciamientoDetalle {
  id: number;
  numeroRefinanciamiento: string;
  empresaId: number;
  empresa: { id: number; nombre: string; rnc: string };
  documentoOriginal: { id: number; numeroDocumento: string; fechaEmision: string; montoTotal: number };
  fecha: string;
  montoOriginal: number;
  montoPagado: number;
  montoPendiente: number;
  fechaVencimiento: string;
  estado: string;
  estadoNombre: string;
  motivo?: string;
  notas?: string;
  creadoPor?: string;
  pagos: Array<{
    id: number;
    fecha: string;
    monto: number;
    metodoPago: string;
    referencia?: string;
    registradoPor?: string;
  }>;
  consumos: Array<{
    consumoId: number;
    monto: number;
    fecha: string;
    clienteNombre?: string;
  }>;
}

/* Tipo "raw" flexible para lo que venga del API */
type RawRef = any;

/* Mapper seguro: convierte el raw (list-item o detail partial) a RefinanciamientoDetalle */
function toRefinanciamientoDetalle(raw: RawRef): RefinanciamientoDetalle {

  if (!raw) {
    throw new Error("Respuesta de refinanciamiento vacía");
  }

  const get = (obj: any, ...keys: string[]) => {
    for (const k of keys) {
      if (obj == null) continue;
      if (k in obj) return obj[k];
    }
    return undefined;
  };

  
  const empresaRaw =
  raw.Empresa ??
  raw.empresa ??
  null;

const empresa = {
  id: Number(get(raw, "empresaId", "EmpresaId") ?? 0),

  nombre:
    empresaRaw?.nombre ??
    raw.empresaNombre ??
    "Empresa desconocida",

  rnc:
    empresaRaw?.rnc ??
    raw.empresaRnc ??
    ""
};

  // documentoOriginal puede venir como string o como objeto; normalizamos
  const docRaw = get(raw, "documentoOriginal", "DocumentoOriginal", "documento") ?? null;
  const documentoOriginal = docRaw && typeof docRaw === "object"
    ? {
        id: Number(get(docRaw, "id", "Id") ?? 0),
        numeroDocumento: String(get(docRaw, "numeroDocumento", "NumeroDocumento") ?? ""),
        fechaEmision: String(get(docRaw, "fechaEmision", "FechaEmision") ?? ""),
        montoTotal: Number(get(docRaw, "montoTotal", "MontoTotal") ?? 0)
      }
    : {
        id: 0,
        numeroDocumento: String(docRaw ?? ""),
        fechaEmision: "",
        montoTotal: 0
      };

  const pagosRaw = get(raw, "pagos", "Pagos") ?? [];
  const pagos = (pagosRaw ?? []).map((p: any) => ({
    id: Number(p?.id ?? p?.Id ?? 0),
    fecha: String(p?.fecha ?? p?.Fecha ?? ""),
    monto: Number(p?.monto ?? p?.Monto ?? 0),
    metodoPago: String(p?.metodoPago ?? p?.MetodoPago ?? p?.metodo ?? ""),
    referencia: p?.referencia ?? p?.Referencia ?? undefined,
    registradoPor: p?.registradoPor ?? p?.RegistradoPor ?? undefined
  }));

  const consumosRaw = get(raw, "consumos", "Consumos") ?? [];
  const consumos = (consumosRaw ?? []).map((c: any) => ({
    consumoId: Number(c?.consumoId ?? c?.ConsumoId ?? c?.id ?? c?.Id ?? 0),
    monto: Number(c?.monto ?? c?.Monto ?? 0),
    fecha: String(c?.fecha ?? c?.Fecha ?? ""),
    clienteNombre: c?.clienteNombre ?? c?.ClienteNombre ?? c?.cliente ?? c?.Cliente?.nombre ?? undefined
  }));

  const detalle: RefinanciamientoDetalle = {
    id: Number(get(raw, "id", "Id") ?? 0),
    numeroRefinanciamiento: String(get(raw, "numeroRefinanciamiento", "NumeroRefinanciamiento") ?? ""),
    empresaId: Number(get(raw, "empresaId", "EmpresaId") ?? empresa.id),
    empresa,
    documentoOriginal,
    fecha: String(get(raw, "fecha", "Fecha") ?? ""),
    montoOriginal: Number(get(raw, "montoOriginal", "MontoOriginal") ?? 0),
    montoPagado: Number(get(raw, "montoPagado", "MontoPagado") ?? 0),
    montoPendiente: Number(get(raw, "montoPendiente", "MontoPendiente") ?? 0),
    fechaVencimiento: String(get(raw, "fechaVencimiento", "FechaVencimiento") ?? ""),
    estado: String(get(raw, "estado", "Estado") ?? ""),
    estadoNombre: String(get(raw, "estadoNombre", "EstadoNombre") ?? ""),
    motivo: get(raw, "motivo", "Motivo"),
    notas: get(raw, "notas", "Notas"),
    creadoPor: get(raw, "creadoPor", "CreadoPor"),
    pagos,
    consumos
  };

  return detalle;
}

/* Componente */
export default function RefinanciamientoDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [refinanciamiento, setRefinanciamiento] = useState<RefinanciamientoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal pago
  const [showPagar, setShowPagar] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState(1);
  const [referencia, setReferencia] = useState("");
  const [notasPago, setNotasPago] = useState("");

  // Modal castigar
  const [showCastigar, setShowCastigar] = useState(false);
  const [castigando, setCastigando] = useState(false);
  const [motivoCastigo, setMotivoCastigo] = useState("");

  useEffect(() => {
    if (id) {
      loadRefinanciamiento(parseInt(id, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadRefinanciamiento = async (refId: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await refinanciamientoApi.obtener(refId);
      console.log("RAW refinanciamiento:", data);
      const detalle = toRefinanciamientoDetalle(data);
      setRefinanciamiento(detalle);

      // Prellenar monto con montoPendiente (seguro)
      setMonto(String(Number(detalle.montoPendiente ?? 0)));
    } catch (err) {
      console.error("Error cargando refinanciamiento:", err);
      setError("No se pudo cargar el refinanciamiento");
      setRefinanciamiento(null);
      setMonto("");
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    if (!refinanciamiento) return;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    if (montoNum > (refinanciamiento.montoPendiente ?? 0)) {
      alert(`El monto no puede exceder ${formatCurrency(refinanciamiento.montoPendiente ?? 0)}`);
      return;
    }

    setPagando(true);
    try {
      const result = await refinanciamientoApi.registrarPago(refinanciamiento.id, {
        monto: montoNum,
        metodoPago,
        referencia: referencia || undefined,
        notas: notasPago || undefined,
      });

      alert(`Pago registrado. Nuevo saldo: ${formatCurrency(Number(result?.nuevoSaldo ?? 0))}`);
      setShowPagar(false);
      setReferencia("");
      setNotasPago("");
      await loadRefinanciamiento(refinanciamiento.id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      alert(errorObj.response?.data?.message || "Error al registrar pago");
    } finally {
      setPagando(false);
    }
  };

  const handleCastigar = async () => {
    if (!refinanciamiento) return;

    setCastigando(true);
    try {
      await refinanciamientoApi.castigar(refinanciamiento.id, motivoCastigo);
      alert("Refinanciamiento castigado exitosamente");
      setShowCastigar(false);
      await loadRefinanciamiento(refinanciamiento.id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      alert(errorObj.response?.data?.message || "Error al castigar refinanciamiento");
    } finally {
      setCastigando(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    const v = Number(value ?? 0);
    return `RD$${v.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-DO");
  };

  const formatDateTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString("es-DO");
  };

  const getEstadoBadge = (estado: string | undefined) => {
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
      case "Castigado":
        return <span className={`${baseClass} bg-gray-800 text-white`}>Castigado</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-700`}>{estado ?? "-"}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando refinanciamiento...</div>
      </div>
    );
  }

  if (error || !refinanciamiento) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error || "Refinanciamiento no encontrado"}</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-xl border hover:bg-gray-50">
          Volver
        </button>
      </div>
    );
  }

  const consumos = refinanciamiento.consumos ?? [];
  const pagos = refinanciamiento.pagos ?? [];

  const puedePagar = refinanciamiento.estadoNombre !== "Pagado" && refinanciamiento.estadoNombre !== "Castigado";
  const puedeCastigar = refinanciamiento.estadoNombre !== "Pagado" && refinanciamiento.estadoNombre !== "Castigado";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Volver a refinanciamientos
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              {refinanciamiento.numeroRefinanciamiento}
              {getEstadoBadge(refinanciamiento.estadoNombre)}
            </h1>
            <p className="text-gray-500 mt-1">{refinanciamiento.empresa.nombre}</p>
          </div>
          <div className="flex gap-2">
            {puedePagar && (
              <button onClick={() => setShowPagar(true)} className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
                Registrar Pago
              </button>
            )}
            {puedeCastigar && (
              <button onClick={() => setShowCastigar(true)} className="px-4 py-2 rounded-xl border border-gray-400 text-gray-600 hover:bg-gray-100">
                Castigar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info general */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Información General</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Empresa</p>
                <p className="font-medium">{refinanciamiento.empresa.nombre}</p>
                <p className="text-xs text-gray-400">RNC: {refinanciamiento.empresa.rnc}</p>
              </div>
              <div>
                <p className="text-gray-500">Documento Original</p>
                <p className="font-medium">{refinanciamiento.documentoOriginal.numeroDocumento}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(refinanciamiento.documentoOriginal.fechaEmision)} • {formatCurrency(refinanciamiento.documentoOriginal.montoTotal)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Fecha de Refinanciamiento</p>
                <p className="font-medium">{formatDate(refinanciamiento.fecha)}</p>
              </div>
              <div>
                <p className="text-gray-500">Nuevo Vencimiento</p>
                <p className={`font-medium ${new Date(refinanciamiento.fechaVencimiento) < new Date() && refinanciamiento.estadoNombre !== "Pagado" ? "text-red-600" : ""}`}>
                  {formatDate(refinanciamiento.fechaVencimiento)}
                </p>
              </div>
              {refinanciamiento.creadoPor && (
                <div>
                  <p className="text-gray-500">Creado por</p>
                  <p className="font-medium">{refinanciamiento.creadoPor}</p>
                </div>
              )}
            </div>
            {refinanciamiento.motivo && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Motivo del refinanciamiento</p>
                <p className="text-sm">{refinanciamiento.motivo}</p>
              </div>
            )}
            {refinanciamiento.notas && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="text-sm whitespace-pre-wrap">{refinanciamiento.notas}</p>
              </div>
            )}
          </div>

          {/* Consumos originales */}
          {consumos.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Consumos del Documento Original ({consumos.length})
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
                    {consumos.map((c, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{formatDateTime(c.fecha)}</td>
                        <td className="px-3 py-2">{c.clienteNombre || "—"}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(c.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagos */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Historial de Pagos ({pagos.length})
            </h2>
            {pagos.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay pagos registrados</p>
            ) : (
              <div className="space-y-3">
                {pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div>
                      <p className="font-medium text-purple-900">{formatDateTime(pago.fecha)}</p>
                      <p className="text-sm text-purple-700">
                        {pago.metodoPago}
                        {pago.referencia && ` • Ref: ${pago.referencia}`}
                      </p>
                      {pago.registradoPor && <p className="text-xs text-purple-500">Por: {pago.registradoPor}</p>}
                    </div>
                    <p className="text-lg font-bold text-purple-700">{formatCurrency(pago.monto)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Resumen financiero */}
          <div className="bg-purple-50 rounded-2xl p-6">
            <h2 className="font-semibold text-purple-900 mb-4">Resumen</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-700">Monto Refinanciado</span>
                <span className="text-xl font-bold text-purple-900">{formatCurrency(refinanciamiento.montoOriginal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">Pagado</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(refinanciamiento.montoPagado)}</span>
              </div>
              <hr className="border-purple-200" />
              <div className="flex justify-between items-center">
                <span className="text-purple-700 font-medium">Pendiente</span>
                <span className="text-2xl font-bold text-purple-900">{formatCurrency(refinanciamiento.montoPendiente)}</span>
              </div>

              {/* Barra de progreso */}
              <div className="mt-2">
                <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all"
                    style={{
                      width: `${(refinanciamiento.montoOriginal ?? 0) > 0 ? ((refinanciamiento.montoPagado ?? 0) / (refinanciamiento.montoOriginal ?? 1)) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-purple-600 mt-1 text-center">
                  {refinanciamiento.montoOriginal > 0 ? Math.round(((refinanciamiento.montoPagado ?? 0) / (refinanciamiento.montoOriginal ?? 1)) * 100) : 0}% pagado
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Acciones</h2>
            <div className="space-y-2">
              {puedePagar && (
                <button onClick={() => setShowPagar(true)} className="w-full px-4 py-2 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200">
                  💰 Registrar Pago
                </button>
              )}
              {puedeCastigar && (
                <button onClick={() => setShowCastigar(true)} className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">
                  ⚠️ Castigar Deuda
                </button>
              )}
            </div>
          </div>

          {/* Info de castigo */}
          {refinanciamiento.estadoNombre === "Castigado" && (
            <div className="bg-gray-800 text-white rounded-2xl p-6">
              <h2 className="font-semibold mb-2">⚠️ Deuda Castigada</h2>
              <p className="text-sm text-gray-300">
                Esta deuda fue marcada como irrecuperable. El saldo pendiente de {formatCurrency(refinanciamiento.montoPendiente)} ya no se espera cobrar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Pagar */}
      {showPagar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Registrar Pago</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RD$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 border rounded-xl"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Máximo: {formatCurrency(refinanciamiento.montoPendiente)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
                <select value={metodoPago} onChange={(e) => setMetodoPago(parseInt(e.target.value, 10))} className="w-full px-4 py-2 border rounded-xl">
                  {METODOS_PAGO.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full px-4 py-2 border rounded-xl" placeholder="Número de transferencia, cheque, etc." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea value={notasPago} onChange={(e) => setNotasPago(e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-xl" />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowPagar(false)} className="px-4 py-2 rounded-xl border hover:bg-gray-50" disabled={pagando}>
                Cancelar
              </button>
              <button onClick={handlePagar} disabled={pagando} className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
                {pagando ? "Registrando..." : "Registrar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Castigar */}
      {showCastigar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Castigar Deuda</h2>

            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
              <p className="font-medium">⚠️ Acción Importante</p>
              <p>Al castigar esta deuda:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Se marcará como irrecuperable</li>
                <li>El saldo de {formatCurrency(refinanciamiento.montoPendiente)} se dará por perdido</li>
                <li>No se podrán registrar más pagos</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del castigo</label>
              <textarea value={motivoCastigo} onChange={(e) => setMotivoCastigo(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-xl" placeholder="Describa por qué se castiga esta deuda..." />
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowCastigar(false)} className="px-4 py-2 rounded-xl border hover:bg-gray-50" disabled={castigando}>
                Cancelar
              </button>
              <button onClick={handleCastigar} className="px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50" disabled={castigando}>
                {castigando ? "Procesando..." : "Confirmar Castigo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
