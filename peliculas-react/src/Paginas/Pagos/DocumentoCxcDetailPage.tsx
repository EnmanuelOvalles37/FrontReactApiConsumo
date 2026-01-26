/*
/* eslint-disable @typescript-eslint/no-explicit-any /
// src/Paginas/Pagos/DocumentoCxcDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { cobrosApi, refinanciamientoApi /*, type CxcDocumentoDetalle / } from "../../Servicios/pagosApi";

// Si tienes una interfaz real para el documento, úsala en lugar de `any`.
type DocumentoType = any;

export default function DocumentoCxcDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [documento, setDocumento] = useState<DocumentoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal refinanciamiento
  const [showRefinanciar, setShowRefinanciar] = useState(false);
  const [refinanciando, setRefinanciando] = useState(false);
  const [diasVencimiento, setDiasVencimiento] = useState(30);
  const [motivoRef, setMotivoRef] = useState("");

  useEffect(() => {
    if (id) {
      loadDocumento(parseInt(id, 10));
    }
  }, [id]);

  const loadDocumento = async (docId: number) => {
  setLoading(true);
  setError("");
  try {
    const dataRaw = await cobrosApi.obtenerDocumento(docId);

    // Normalización robusta: admite PascalCase (Consumos) o camelCase (consumos)
    const get = (obj: any, ...keys: string[]) => {
      for (const k of keys) {
        if (obj == null) continue;
        if (k in obj) return obj[k];
      }
      return undefined;
    };

    const normalized: any = {
      // ids / básicos
      id: get(dataRaw, "id", "Id"),
      numeroDocumento: get(dataRaw, "numeroDocumento", "NumeroDocumento") ?? get(dataRaw, "numero_documento"),
      empresaId: get(dataRaw, "empresaId", "EmpresaId"),
      empresaNombre: get(dataRaw, "empresaNombre", "EmpresaNombre") ?? get(get(dataRaw, "empresa", "Empresa"), "nombre"),
      empresaRnc: get(dataRaw, "empresaRnc", "EmpresaRnc") ?? get(get(dataRaw, "empresa", "Empresa"), "rnc"),

      // fechas y periodos
      fechaEmision: get(dataRaw, "fechaEmision", "FechaEmision"),
      fechaVencimiento: get(dataRaw, "fechaVencimiento", "FechaVencimiento"),
      periodoDesde: get(dataRaw, "periodoDesde", "PeriodoDesde"),
      periodoHasta: get(dataRaw, "periodoHasta", "PeriodoHasta"),

      // montos
      montoTotal: Number(get(dataRaw, "montoTotal", "MontoTotal") ?? 0),
      montoPagado: Number(get(dataRaw, "montoPagado", "MontoPagado") ?? 0),
      montoPendiente: Number(get(dataRaw, "montoPendiente", "MontoPendiente") ?? 0),

      // estado
      refinanciado: Boolean(get(dataRaw, "refinanciado", "Refinanciado") ?? false),
      estadoNombre: get(dataRaw, "estadoNombre", "EstadoNombre") ?? get(dataRaw, "estado", "Estado")?.toString(),

      // arrays (asegurar que sean arrays)
      consumos: get(dataRaw, "consumos", "Consumos") ?? [],
      pagos: get(dataRaw, "pagos", "Pagos") ?? [],

      notas: get(dataRaw, "notas", "Notas") ?? null,
      refinanciamiento: get(dataRaw, "refinanciamiento", "Refinanciamiento") ?? null,
    };

    // Si consumos vienen con nombres de campos en PascalCase dentro del array, opcionalmente normalízalos también:
    normalized.consumos = normalized.consumos.map((c: any) => ({
      id: c.id ?? c.Id,
      fecha: c.fecha ?? c.Fecha,
      clienteNombre: c.clienteNombre ?? c.ClienteNombre ?? c.nombreCliente ?? c.Cliente?.nombre,
      clienteCedula: c.clienteCedula ?? c.ClienteCedula ?? c.cedula ?? c.Cliente?.cedula,
      monto: Number(c.monto ?? c.Monto ?? 0),
      // copia cualquier campo adicional que uses
    }));

    // Normalizar pagos (si aplica)
    normalized.pagos = normalized.pagos.map((p: any) => ({
      id: p.id ?? p.Id,
      fecha: p.fecha ?? p.Fecha,
      numeroRecibo: (p.numeroRecibo ?? p.NumeroRecibo ?? p.Numero) || null,
      metodoPagoNombre: (p.metodoPagoNombre ?? p.MetodoPagoNombre ?? p.metodo) || "",
      monto: Number(p.monto ?? p.Monto ?? 0),
      referencia: p.referencia ?? p.Referencia ?? null,
      banco: p.banco ?? p.Banco ?? null,
      registradoPor: p.registradoPor ?? p.RegistradoPor ?? null,
    }));

    setDocumento(normalized);
  } catch (err) {
    console.error("Error cargando documento:", err);
    setError("No se pudo cargar el documento");
    setDocumento(null);
  } finally {
    setLoading(false);
  }
};

  const handleRefinanciar = async () => {
    if (!documento) return;

    setRefinanciando(true);
    try {
      const result = await refinanciamientoApi.crear({
        cxcDocumentoId: documento.id,
        diasParaVencimiento: diasVencimiento,
        motivo: motivoRef || undefined,
      });

      alert(
        `Refinanciamiento creado exitosamente.\n` +
          `Número: ${result.numeroRefinanciamiento}\n` +
          `Se restauró el crédito de ${result.clientesRestaurados} empleados.`
      );

      setShowRefinanciar(false);
      await loadDocumento(documento.id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      alert(errorObj.response?.data?.message || "Error al crear refinanciamiento");
    } finally {
      setRefinanciando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${Number(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return dateStr ? new Date(dateStr).toLocaleDateString("es-DO") : "-";
  };

  const formatDateTime = (dateStr: string) => {
    return dateStr ? new Date(dateStr).toLocaleString("es-DO") : "-";
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
      case "Refinanciado":
        return <span className={`${baseClass} bg-purple-100 text-purple-700`}>Refinanciado</span>;
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
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error || "Documento no encontrado"}</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-xl border hover:bg-gray-50">
          Volver
        </button>
      </div>
    );
  }

  // Normalizo aquí también por seguridad al render
  const consumos = documento.consumos ?? [];
  const pagos = documento.pagos ?? [];

  const puedeRefinanciar =
    !documento.refinanciado &&
    documento.estadoNombre !== "Pagado" &&
    documento.estadoNombre !== "Anulado" &&
    (documento.montoPendiente ?? 0) > 0;

  const puedePagar =
    !documento.refinanciado && documento.estadoNombre !== "Pagado" && documento.estadoNombre !== "Anulado";

  // Debug opcional
  // console.log("Documento:", documento);

  return (
    <div className="p-6">
      {/* Header /}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Volver a documentos
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              {documento.numeroDocumento} {getEstadoBadge(documento.estadoNombre)}
            </h1>
            <p className="text-gray-500 mt-1">{documento.empresaNombre}</p>
          </div>
          <div className="flex gap-2">
            {puedePagar && (
              <Link to={`/pagos/cobros/pagar/${documento.id}`} className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">
                Registrar Cobro
              </Link>
            )}
            {puedeRefinanciar && (
              <button onClick={() => setShowRefinanciar(true)} className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
                Refinanciar
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
                <p className="text-gray-500">Empresa</p>
                <p className="font-medium">{documento.empresaNombre}</p>
                <p className="text-xs text-gray-400">RNC: {documento.empresaRnc}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha de Emisión</p>
                <p className="font-medium">{formatDate(documento.fechaEmision)}</p>
              </div>
              <div>
                <p className="text-gray-500">Período</p>
                <p className="font-medium">
                  {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Vencimiento</p>
                <p
                  className={`font-medium ${
                    new Date(documento.fechaVencimiento) < new Date() && documento.estadoNombre !== "Pagado"
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {formatDate(documento.fechaVencimiento)}
                </p>
              </div>
            </div>
            {documento.notas && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="text-sm">{documento.notas}</p>
              </div>
            )}
          </div>

          {/* Consumos /}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Consumos Incluidos ({consumos.length})</h2>

            {consumos.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay consumos</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Cliente</th>
                      <th className="px-3 py-2 text-left">Cédula</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumos.map((c: any) => (
                      <tr key={c.id ?? `${c.fecha}-${c.monto}`} className="border-t">
                        <td className="px-3 py-2">{formatDateTime(c.fecha)}</td>
                        <td className="px-3 py-2">{c.clienteNombre ?? "-"}</td>
                        <td className="px-3 py-2">{c.clienteCedula ?? "-"}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(Number(c.monto ?? 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right">
                        Total:
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(documento.montoTotal ?? 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Pagos /}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Historial de Pagos ({pagos.length})</h2>
            {pagos.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay pagos registrados</p>
            ) : (
              <div className="space-y-3">
                {pagos.map((pago: any) => (
                  <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">{pago.numeroRecibo}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(pago.fecha)} • {pago.metodoPagoNombre}
                        {pago.referencia && ` • Ref: ${pago.referencia}`}
                      </p>
                      {pago.banco && <p className="text-xs text-gray-400">Banco: {pago.banco}</p>}
                      {pago.registradoPor && <p className="text-xs text-gray-400">Por: {pago.registradoPor}</p>}
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(Number(pago.monto ?? 0))}</p>
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
                <span className="text-xl font-bold">{formatCurrency(documento.montoTotal ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pagado</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(documento.montoPagado ?? 0)}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Pendiente</span>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(documento.montoPendiente ?? 0)}</span>
              </div>

              {/* Barra de progreso /}
              <div className="mt-2">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${documento.montoTotal > 0 ? ((documento.montoPagado ?? 0) / (documento.montoTotal ?? 1)) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {documento.montoTotal > 0 ? Math.round(((documento.montoPagado ?? 0) / (documento.montoTotal ?? 1)) * 100) : 0}% cobrado
                </p>
              </div>
            </div>
          </div>

          {/* Refinanciamiento /}
          {documento.refinanciamiento && (
            <div className="bg-purple-50 rounded-2xl p-6">
              <h2 className="font-semibold text-purple-900 mb-4">Refinanciamiento</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Número</span>
                  <span className="font-medium">{documento.refinanciamiento.numeroRefinanciamiento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Monto Original</span>
                  <span className="font-medium">{formatCurrency(documento.refinanciamiento.montoOriginal ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Pendiente</span>
                  <span className="font-medium">{formatCurrency(documento.refinanciamiento.montoPendiente ?? 0)}</span>
                </div>
                <Link to={`/pagos/refinanciamiento/${documento.refinanciamiento.id}`} className="block mt-3 text-center px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
                  Ver Refinanciamiento
                </Link>
              </div>
            </div>
          )}

          {/* Acciones rápidas /}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Acciones</h2>
            <div className="space-y-2">
              {puedePagar && (
                <Link to={`/pagos/cobros/pagar/${documento.id}`} className="block w-full text-center px-4 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200">
                  💰 Registrar Cobro
                </Link>
              )}
              {puedeRefinanciar && (
                <button onClick={() => setShowRefinanciar(true)} className="w-full px-4 py-2 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200">
                  🔄 Refinanciar Deuda
                </button>
              )}
              <Link to={`/pagos/cobros/empresas/${documento.empresaId}/estado-cuenta`} className="block w-full text-center px-4 py-2 rounded-xl border hover:bg-gray-50">
                📊 Estado de Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Refinanciar /}
      {showRefinanciar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Refinanciar Deuda</h2>

            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
              <p className="font-medium">⚠️ Importante</p>
              <p>Al refinanciar, los empleados de la empresa recuperarán su crédito disponible.</p>
              <p className="mt-1">Solo se permite 1 refinanciamiento por documento.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Refinanciar</label>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(documento.montoPendiente ?? 0)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días para nuevo vencimiento</label>
                <input
                  type="number"
                  value={diasVencimiento}
                  onChange={(e) => setDiasVencimiento(parseInt(e.target.value, 10) || 30)}
                  min={1}
                  max={365}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del refinanciamiento</label>
                <textarea value={motivoRef} onChange={(e) => setMotivoRef(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-xl" placeholder="Acuerdo de pago, dificultades financieras, etc." />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowRefinanciar(false)} className="px-4 py-2 rounded-xl border hover:bg-gray-50" disabled={refinanciando}>
                Cancelar
              </button>
              <button onClick={handleRefinanciar} disabled={refinanciando} className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
                {refinanciando ? "Procesando..." : "Confirmar Refinanciamiento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/DocumentoCxcDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { cobrosApi, refinanciamientoApi } from "../../Servicios/pagosApi";
import DocumentoCxcDetalleModal from "../../Componentes/Comprobantes/DocumentoCxcDetalleModal";


type DocumentoType = any;

export default function DocumentoCxcDetailPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [documento, setDocumento] = useState<DocumentoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal detalle consumos
  const [showDetalleConsumos, setShowDetalleConsumos] = useState(false);

  // Modal refinanciamiento
  const [showRefinanciar, setShowRefinanciar] = useState(false);
  const [refinanciando, setRefinanciando] = useState(false);
  const [diasVencimiento, setDiasVencimiento] = useState(30);
  const [motivoRef, setMotivoRef] = useState("");

  useEffect(() => {
    if (id) {
      loadDocumento(parseInt(id, 10));
    }
  }, [id]);

  const loadDocumento = async (docId: number) => {
    setLoading(true);
    setError("");
    try {
      const dataRaw = await cobrosApi.obtenerDocumento(docId);

      // Normalización robusta
      const get = (obj: any, ...keys: string[]) => {
        for (const k of keys) {
          if (obj == null) continue;
          if (k in obj) return obj[k];
        }
        return undefined;
      };

      const normalized: any = {
        id: get(dataRaw, "id", "Id"),
        numeroDocumento: get(dataRaw, "numeroDocumento", "NumeroDocumento") ?? get(dataRaw, "numero_documento"),
        empresaId: get(dataRaw, "empresaId", "EmpresaId"),
        empresaNombre: get(dataRaw, "empresaNombre", "EmpresaNombre") ?? get(get(dataRaw, "empresa", "Empresa"), "nombre"),
        empresaRnc: get(dataRaw, "empresaRnc", "EmpresaRnc") ?? get(get(dataRaw, "empresa", "Empresa"), "rnc"),
        fechaEmision: get(dataRaw, "fechaEmision", "FechaEmision"),
        fechaVencimiento: get(dataRaw, "fechaVencimiento", "FechaVencimiento"),
        periodoDesde: get(dataRaw, "periodoDesde", "PeriodoDesde"),
        periodoHasta: get(dataRaw, "periodoHasta", "PeriodoHasta"),
        montoTotal: Number(get(dataRaw, "montoTotal", "MontoTotal") ?? 0),
        montoPagado: Number(get(dataRaw, "montoPagado", "MontoPagado") ?? 0),
        montoPendiente: Number(get(dataRaw, "montoPendiente", "MontoPendiente") ?? 0),
        cantidadConsumos: Number(get(dataRaw, "cantidadConsumos", "CantidadConsumos") ?? 0),
        cantidadEmpleados: Number(get(dataRaw, "cantidadEmpleados", "CantidadEmpleados") ?? 0),
        refinanciado: Boolean(get(dataRaw, "refinanciado", "Refinanciado") ?? false),
        estadoNombre: get(dataRaw, "estadoNombre", "EstadoNombre") ?? get(dataRaw, "estado", "Estado")?.toString(),
        consumos: get(dataRaw, "consumos", "Consumos") ?? [],
        pagos: get(dataRaw, "pagos", "Pagos") ?? [],
        notas: get(dataRaw, "notas", "Notas") ?? null,
        refinanciamiento: get(dataRaw, "refinanciamiento", "Refinanciamiento") ?? null,
      };

      // Normalizar consumos
      normalized.consumos = normalized.consumos.map((c: any) => ({
        id: c.id ?? c.Id,
        fecha: c.fecha ?? c.Fecha,
        clienteNombre: c.clienteNombre ?? c.ClienteNombre ?? c.nombreCliente ?? c.Cliente?.nombre,
        clienteCedula: c.clienteCedula ?? c.ClienteCedula ?? c.cedula ?? c.Cliente?.cedula,
        monto: Number(c.monto ?? c.Monto ?? 0),
      }));

      // Normalizar pagos
      normalized.pagos = normalized.pagos.map((p: any) => ({
        id: p.id ?? p.Id,
        fecha: p.fecha ?? p.Fecha,
        numeroRecibo: (p.numeroRecibo ?? p.NumeroRecibo ?? p.Numero) || null,
        metodoPagoNombre: (p.metodoPagoNombre ?? p.MetodoPagoNombre ?? p.metodo) || "",
        monto: Number(p.monto ?? p.Monto ?? 0),
        referencia: p.referencia ?? p.Referencia ?? null,
        banco: p.banco ?? p.Banco ?? null,
        registradoPor: p.registradoPor ?? p.RegistradoPor ?? null,
      }));

      setDocumento(normalized);
    } catch (err) {
      console.error("Error cargando documento:", err);
      setError("No se pudo cargar el documento");
      setDocumento(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefinanciar = async () => {
    if (!documento) return;

    setRefinanciando(true);
    try {
      const result = await refinanciamientoApi.crear({
        cxcDocumentoId: documento.id,
        diasParaVencimiento: diasVencimiento,
        motivo: motivoRef || undefined,
      });

      alert(
        `Refinanciamiento creado exitosamente.\n` +
          `Número: ${result.numeroRefinanciamiento}\n` +
          `Se restauró el crédito de ${result.clientesRestaurados} empleados.`
      );

      setShowRefinanciar(false);
      await loadDocumento(documento.id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      alert(errorObj.response?.data?.message || "Error al crear refinanciamiento");
    } finally {
      setRefinanciando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${Number(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return dateStr ? new Date(dateStr).toLocaleDateString("es-DO") : "-";
  };

  const formatDateTime = (dateStr: string) => {
    return dateStr ? new Date(dateStr).toLocaleString("es-DO") : "-";
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
      case "Refinanciado":
        return <span className={`${baseClass} bg-purple-100 text-purple-700`}>Refinanciado</span>;
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
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error || "Documento no encontrado"}</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-xl border hover:bg-gray-50">
          Volver
        </button>
      </div>
    );
  }

  const consumos = documento.consumos ?? [];
  const pagos = documento.pagos ?? [];

  const puedeRefinanciar =
    !documento.refinanciado &&
    documento.estadoNombre !== "Pagado" &&
    documento.estadoNombre !== "Anulado" &&
    (documento.montoPendiente ?? 0) > 0;

  const puedePagar =
    !documento.refinanciado && documento.estadoNombre !== "Pagado" && documento.estadoNombre !== "Anulado";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Volver a documentos
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              {documento.numeroDocumento} {getEstadoBadge(documento.estadoNombre)}
            </h1>
            <p className="text-gray-500 mt-1">{documento.empresaNombre}</p>
          </div>
          <div className="flex gap-2">
            {/* NUEVO BOTÓN: Ver Detalle de Consumos */}
            <button
              onClick={() => setShowDetalleConsumos(true)}
              className="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium flex items-center gap-2"
            >
              📋 Ver Detalle Consumos
            </button>
            {puedePagar && (
              <Link
                to={`/pagos/cobros/pagar/${documento.id}`}
                className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Cobro
              </Link>
            )}
            {puedeRefinanciar && (
              <button
                onClick={() => setShowRefinanciar(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
              >
                Refinanciar
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
                <p className="font-medium">{documento.empresaNombre}</p>
                <p className="text-xs text-gray-400">RNC: {documento.empresaRnc}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha de Emisión</p>
                <p className="font-medium">{formatDate(documento.fechaEmision)}</p>
              </div>
              <div>
                <p className="text-gray-500">Período</p>
                <p className="font-medium">
                  {formatDate(documento.periodoDesde)} - {formatDate(documento.periodoHasta)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Vencimiento</p>
                <p
                  className={`font-medium ${
                    new Date(documento.fechaVencimiento) < new Date() && documento.estadoNombre !== "Pagado"
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {formatDate(documento.fechaVencimiento)}
                </p>
              </div>
            </div>
            {documento.notas && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="text-sm">{documento.notas}</p>
              </div>
            )}
          </div>

          {/* Resumen de Consumos - Versión compacta */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Consumos ({documento.cantidadConsumos || consumos.length})
              </h2>
              <button
                onClick={() => setShowDetalleConsumos(true)}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
              >
                Ver detalle completo →
              </button>
            </div>

            {consumos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">Los consumos detallados están disponibles en el detalle completo</p>
                <button
                  onClick={() => setShowDetalleConsumos(true)}
                  className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 font-medium"
                >
                  📋 Ver Detalle de Consumos
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Fecha</th>
                        <th className="px-3 py-2 text-left">Cliente</th>
                        <th className="px-3 py-2 text-left">Cédula</th>
                        <th className="px-3 py-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consumos.slice(0, 5).map((c: any, index: number) => (
                        <tr key={c.id ?? index} className="border-t">
                          <td className="px-3 py-2">{formatDateTime(c.fecha)}</td>
                          <td className="px-3 py-2">{c.clienteNombre ?? "-"}</td>
                          <td className="px-3 py-2">{c.clienteCedula ?? "-"}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(Number(c.monto ?? 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {consumos.length > 5 && (
                  <div className="mt-3 pt-3 border-t text-center">
                    <button
                      onClick={() => setShowDetalleConsumos(true)}
                      className="text-sky-600 hover:text-sky-700 font-medium text-sm"
                    >
                      Ver los {consumos.length - 5} consumos restantes →
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total:</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(documento.montoTotal ?? 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Pagos */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Historial de Pagos ({pagos.length})</h2>
            {pagos.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay pagos registrados</p>
            ) : (
              <div className="space-y-3">
                {pagos.map((pago: any) => (
                  <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">{pago.numeroRecibo}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(pago.fecha)} • {pago.metodoPagoNombre}
                        {pago.referencia && ` • Ref: ${pago.referencia}`}
                      </p>
                      {pago.banco && <p className="text-xs text-gray-400">Banco: {pago.banco}</p>}
                      {pago.registradoPor && <p className="text-xs text-gray-400">Por: {pago.registradoPor}</p>}
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(Number(pago.monto ?? 0))}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Resumen financiero */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monto Total</span>
                <span className="text-xl font-bold">{formatCurrency(documento.montoTotal ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pagado</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(documento.montoPagado ?? 0)}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Pendiente</span>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(documento.montoPendiente ?? 0)}</span>
              </div>

              {/* Barra de progreso */}
              <div className="mt-2">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${documento.montoTotal > 0 ? ((documento.montoPagado ?? 0) / (documento.montoTotal ?? 1)) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {documento.montoTotal > 0 ? Math.round(((documento.montoPagado ?? 0) / (documento.montoTotal ?? 1)) * 100) : 0}% cobrado
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Estadísticas</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">📝 Consumos</span>
                <span className="font-bold text-gray-900">{documento.cantidadConsumos || consumos.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">👥 Empleados</span>
                <span className="font-bold text-gray-900">{documento.cantidadEmpleados || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">💳 Pagos</span>
                <span className="font-bold text-gray-900">{pagos.length}</span>
              </div>
            </div>
          </div>

          {/* Refinanciamiento */}
          {documento.refinanciamiento && (
            <div className="bg-purple-50 rounded-2xl p-6">
              <h2 className="font-semibold text-purple-900 mb-4">Refinanciamiento</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Número</span>
                  <span className="font-medium">{documento.refinanciamiento.numeroRefinanciamiento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Monto Original</span>
                  <span className="font-medium">{formatCurrency(documento.refinanciamiento.montoOriginal ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Pendiente</span>
                  <span className="font-medium">{formatCurrency(documento.refinanciamiento.montoPendiente ?? 0)}</span>
                </div>
                <Link
                  to={`/pagos/refinanciamiento/${documento.refinanciamiento.id}`}
                  className="block mt-3 text-center px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                >
                  Ver Refinanciamiento
                </Link>
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Acciones</h2>
            <div className="space-y-2">
              {/* Botón destacado para ver detalle */}
              <button
                onClick={() => setShowDetalleConsumos(true)}
                className="w-full px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 font-medium flex items-center justify-center gap-2"
              >
                📋 Ver Detalle de Consumos
              </button>

              {puedePagar && (
                <Link
                  to={`/pagos/cobros/pagar/${documento.id}`}
                  className="block w-full text-center px-4 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200"
                >
                  💰 Registrar Cobro
                </Link>
              )}
              {puedeRefinanciar && (
                <button
                  onClick={() => setShowRefinanciar(true)}
                  className="w-full px-4 py-2 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  🔄 Refinanciar Deuda
                </button>
              )}
              <Link
                to={`/pagos/cobros/empresas/${documento.empresaId}/estado-cuenta`}
                className="block w-full text-center px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                📊 Estado de Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalle Consumos */}
      <DocumentoCxcDetalleModal
        open={showDetalleConsumos}
        documentoId={documento?.id || null}
        onClose={() => setShowDetalleConsumos(false)}
      />

      {/* Modal Refinanciar */}
      {showRefinanciar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Refinanciar Deuda</h2>

            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
              <p className="font-medium">⚠️ Importante</p>
              <p>Al refinanciar, los empleados de la empresa recuperarán su crédito disponible.</p>
              <p className="mt-1">Solo se permite 1 refinanciamiento por documento.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Refinanciar</label>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(documento.montoPendiente ?? 0)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días para nuevo vencimiento</label>
                <input
                  type="number"
                  value={diasVencimiento}
                  onChange={(e) => setDiasVencimiento(parseInt(e.target.value, 10) || 30)}
                  min={1}
                  max={365}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del refinanciamiento</label>
                <textarea
                  value={motivoRef}
                  onChange={(e) => setMotivoRef(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-xl"
                  placeholder="Acuerdo de pago, dificultades financieras, etc."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowRefinanciar(false)}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                disabled={refinanciando}
              >
                Cancelar
              </button>
              <button
                onClick={handleRefinanciar}
                disabled={refinanciando}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {refinanciando ? "Procesando..." : "Confirmar Refinanciamiento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}