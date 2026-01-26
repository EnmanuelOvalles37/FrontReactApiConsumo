// Componentes/Clientes/ClientesBulkModal.tsx
import { useState } from "react";
import { clientesApi } from "../../assets/api/ClientesApi";

type Props = {
  open: boolean;
  empresaId: number;
  onClose: () => void;
  onDone: () => void;   // refrescar lista
};

type BulkResult = { insertados: number; actualizados: number; errores: string[] };

export default function ClientesBulkModal({ open, empresaId, onClose, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [upsert, setUpsert] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<BulkResult | null>(null);

  const submit = async () => {
    try {
      setLoading(true); setErr(null); setRes(null);
      if (!file) { setErr("Seleccione un archivo .csv"); return; }
      const { data } = await clientesApi.bulk(empresaId, file, upsert);
      setRes(data);
      onDone();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "No se pudo procesar el archivo");
    } finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const csv = "nombre,cedula,saldoOriginal,activo\nJuan Perez,001-0000000-1,5000.00,true\nMaria Garcia,002-0000000-2,3000.00,true\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "empleados_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFile(null);
    setErr(null);
    setRes(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">📤 Carga masiva de empleados (CSV)</h3>

        <div className="mt-4 grid gap-4">
          {/* Instrucciones */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-sm font-medium text-sky-800 mb-2">Formato del archivo CSV:</p>
            <code className="block rounded bg-white px-3 py-2 text-sm font-mono text-gray-700 border border-sky-100">
              nombre,cedula,saldoOriginal,activo
            </code>
            <div className="mt-3 text-xs text-sky-700 space-y-1">
              <p><strong>nombre:</strong> Nombre completo del empleado (requerido)</p>
              <p><strong>cedula:</strong> Número de cédula (opcional)</p>
              <p><strong>saldoOriginal:</strong> Límite de crédito (requerido)</p>
              <p><strong>activo:</strong> true o false (opcional, default: true)</p>
            </div>
          </div>

          {/* Selector de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={e => {
                setFile(e.target.files?.[0] ?? null);
                setErr(null);
                setRes(null);
              }}
              className="w-full rounded-lg border border-gray-200 p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                📄 Archivo seleccionado: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          {/* Opciones */}
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={upsert}
              onChange={e => setUpsert(e.target.checked)}
              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Actualizar si ya existe (basado en cédula)</span>
          </label>

          {/* Botón de plantilla */}
          <div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              📥 Descargar plantilla de ejemplo
            </button>
          </div>

          {/* Mensajes de error */}
          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm">
              <div className="flex items-start gap-2">
                <span>❌</span>
                <div>{err}</div>
              </div>
            </div>
          )}

          {/* Resultados */}
          {res && (
            <div className="rounded-xl bg-green-50 border border-green-200 text-green-800 p-4 text-sm">
              <p className="font-semibold mb-2">✅ Carga completada</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 border border-green-100">
                  <p className="text-xs text-gray-500">Insertados</p>
                  <p className="text-lg font-bold text-green-600">{res.insertados}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-green-100">
                  <p className="text-xs text-gray-500">Actualizados</p>
                  <p className="text-lg font-bold text-sky-600">{res.actualizados}</p>
                </div>
              </div>
              {res.errores.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="font-medium text-amber-700 mb-1">⚠️ Errores ({res.errores.length}):</p>
                  <ul className="list-disc ml-5 text-xs text-amber-700 max-h-32 overflow-y-auto">
                    {res.errores.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-lg px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {res ? "Cerrar" : "Cancelar"}
          </button>
          {!res && (
            <button
              onClick={submit}
              disabled={loading || !file}
              className="rounded-lg px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Procesando...
                </span>
              ) : (
                "📤 Subir y procesar"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}