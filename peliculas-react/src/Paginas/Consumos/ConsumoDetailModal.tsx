/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Componentes/Consumos/ConsumoDetailModal.tsx
import { useEffect, useState } from "react";
import { consumosApi, type ConsumoDetailDto } from "../../assets/api/consumosApi";


type Props = {
  open: boolean;
  consumoId: number | null;
  onClose: () => void;
  onChanged?: () => void; // para refrescar listas externas
};

export default function ConsumoDetailModal({ open, consumoId, onClose, onChanged }: Props) {
  const [data, setData] = useState<ConsumoDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !consumoId) { setData(null); setErr(null); return; }
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const d = await consumosApi.getById(consumoId);
        setData(d);
      } catch (e: any) {
        setErr(e?.response?.data ?? "No se pudo cargar el consumo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, consumoId]);

  const doReversar = async () => {
    if (!data || data.reversado) return;
    if (!confirm(`¿Reversar el consumo #${data.id} por RD$ ${data.monto.toLocaleString()}?`)) return;

    try {
      setReversing(true);
      await consumosApi.reversar(data.id);
      setData({ ...data, reversado: true });
      onChanged?.();
    } catch (e: any) {
      setErr(e?.response?.data ?? "No se pudo reversar el consumo.");
    } finally {
      setReversing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Detalle de consumo</h3>
          <button className="text-gray-500 hover:text-black" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-600">Cargando…</div>
        ) : err ? (
          <div className="mt-3 rounded-lg bg-red-50 text-red-700 p-2 text-sm">{err}</div>
        ) : !data ? (
          <div className="py-10 text-center text-gray-600">Sin datos.</div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Item k="Id" v={`#${data.id}`} />
              <Item k="Fecha" v={new Date(data.fecha).toLocaleString()} />
              <Item k="Empresa" v={`${data.empresa} (ID ${data.empresaId})`} />
              <Item k="Cliente" v={`${data.cliente} (ID ${data.clienteId})`} />
              <Item k="Proveedor" v={`${data.proveedor} (ID ${data.proveedorId})`} />
              <Item k="Monto" v={`RD$ ${data.monto.toLocaleString()}`} />
              <Item k="Concepto" v={data.concepto || "—"} />
              <Item k="Referencia" v={data.referencia || "—"} />
              <Item
                k="Estado"
                v={
                  <span className={`px-2 py-0.5 text-xs rounded ${data.reversado ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-700"}`}>
                    {data.reversado ? "Reversado" : "Vigente"}
                  </span>
                }
              />
              <Item k="Creado (UTC)" v={data.creadoUtc ? new Date(data.creadoUtc).toLocaleString() : "—"} />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg px-4 py-2 border">Cerrar</button>
              <button
                onClick={doReversar}
                disabled={reversing || data.reversado}
                className="rounded-lg px-4 py-2 bg-rose-700 text-white hover:bg-rose-800 disabled:opacity-40"
                title={data.reversado ? "Ya reversado" : "Reversar consumo"}
              >
                {reversing ? "Reversando…" : "Reversar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{k}</p>
      <p className="font-medium break-words">{v}</p>
    </div>
  );
}
