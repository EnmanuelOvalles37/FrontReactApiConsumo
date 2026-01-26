import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import type { CxpItem, CxpPago, PagedResult } from "../../assets/types/cxp";

type Props = {
  row: CxpItem;
  onClose: () => void;
};

export default function VerPagosModal({ row, onClose }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState<CxpPago[]>([]);
  const [total, setTotal] = useState(0);
  const [sumMonto, setSumMonto] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchPagos = useCallback(async (p: number) => {
    try {
      setLoading(true); setErr(null);
      const { data } = await axios.get<PagedResult<CxpPago>>(`/api/cxp/${row.id}/pagos`, {
        params: { page: p, pageSize }
      });
      setData(data.data);
      setTotal(data.total);
      setSumMonto(data.sumMonto ?? 0);
      setPage(p);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "Error cargando pagos");
    } finally {
      setLoading(false);
    }
  }, [row.id, pageSize]);

  useEffect(() => { fetchPagos(1); }, [fetchPagos]);

  const prev = () => page > 1 && fetchPagos(page - 1);
  const next = () => page * pageSize < total && fetchPagos(page + 1);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pagos del documento</h3>
            <p className="text-sm text-gray-600">
              Proveedor: <b>{row.proveedorNombre}</b> — Doc: <b>{row.documento}</b><br/>
              Balance actual: <b>RD$ {row.balance.toLocaleString()}</b>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        {err && <div className="mt-3 rounded bg-red-50 text-red-700 p-2 text-sm">{err}</div>}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-left px-3 py-2">Medio</th>
                <th className="text-left px-3 py-2">Referencia</th>
                <th className="text-left px-3 py-2">Observación</th>
                <th className="text-right px-3 py-2">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-3 py-2">Cargando…</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={5} className="px-3 py-2">Sin pagos</td></tr>}
              {!loading && data.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{new Date(p.fecha).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{p.medioPago}</td>
                  <td className="px-3 py-2">{p.referencia || "-"}</td>
                  <td className="px-3 py-2">{p.observacion || "-"}</td>
                  <td className="px-3 py-2 text-right">{p.monto.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div>Mostrando {data.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + data.length} de {total}</div>
          <div className="font-medium">Total (página): RD$ {sumMonto.toFixed(2)}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={prev} disabled={page === 1 || loading}>Anterior</button>
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={next} disabled={page * pageSize >= total || loading}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
