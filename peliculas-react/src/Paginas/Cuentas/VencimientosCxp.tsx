import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { PagedResult } from "../../assets/types/cxp";
import type { CxpVencProveedor, CxpVencDetalle } from "../../assets/types/cxp";
import { useAuth } from "../../Context/AuthContext";
import AutocompleteProveedor from "../../Componentes/AutocompleteProveedor";

function DetalleModal({
  proveedorId, proveedorNombre, fechaCorte, bucket, onClose
}: {
  proveedorId: string; proveedorNombre: string; fechaCorte: string; bucket: string;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<CxpVencDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  //const [proveedor, setProveedor] = useState(""); // sigue siendo el RNC (ProveedorId)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr(null);
        const { data } = await axios.get<CxpVencDetalle[]>("/api/cxp/vencimientos/detalle", {
          params: { proveedorId, bucket, fechaCorte }
        });
        setRows(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.response?.data ?? "Error cargando detalle");
      } finally {
        setLoading(false);
      }
    })();
  }, [proveedorId, bucket, fechaCorte]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Detalle {bucket}</h3>
            <p className="text-sm text-gray-600">
              Proveedor: <b>{proveedorNombre}</b> — Corte: <b>{fechaCorte}</b>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        {err && <div className="mt-3 rounded bg-red-50 text-red-700 p-2 text-sm">{err}</div>}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Documento</th>
                <th className="px-3 py-2 text-left">Concepto</th>
                <th className="px-3 py-2 text-right">Monto</th>
                <th className="px-3 py-2 text-right">Balance</th>
                <th className="px-3 py-2 text-right">Días</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-3 py-2">Cargando…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-3 py-2">Sin documentos</td></tr>}
              {!loading && rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{new Date(r.fecha).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{r.documento}</td>
                  <td className="px-3 py-2">{r.concepto ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{r.monto.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{r.balance.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{r.dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function VencimientosCxp() {
  const { hasPermission } = useAuth();
  const [proveedor, setProveedor] = useState("");
  const [fechaCorte, setFechaCorte] = useState(() => new Date().toISOString().slice(0,10));
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [rows, setRows] = useState<CxpVencProveedor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [detalle, setDetalle] = useState<{open:boolean; proveedorId?:string; proveedorNombre?:string; bucket?:string}>({open:false});

  const fetchData = useCallback(async (p: number) => {
    try {
      setLoading(true); setErr(null);
      const { data } = await axios.get<PagedResult<CxpVencProveedor>>("/api/cxp/vencimientos", {
        params: { proveedor, fechaCorte, page: p, pageSize }
      });
      setRows(data.data);
      setTotal(data.total);
      setPage(p);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "Error cargando vencimientos");
      setRows([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [proveedor, fechaCorte, pageSize]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const openDetalle = (r: CxpVencProveedor, bucket: string) =>
    setDetalle({ open: true, proveedorId: r.proveedorId, proveedorNombre: r.proveedorNombre, bucket });

  const next = () => page * pageSize < total && fetchData(page + 1);
  const prev = () => page > 1 && fetchData(page - 1);

  const totalRow = useMemo(() => ({
    noVencido: rows.reduce((a,b)=>a+b.noVencido,0),
    d0_30   : rows.reduce((a,b)=>a+b.d0_30,0),
    d31_60  : rows.reduce((a,b)=>a+b.d31_60,0),
    d61_90  : rows.reduce((a,b)=>a+b.d61_90,0),
    d90p    : rows.reduce((a,b)=>a+b.d90p,0),
    total   : rows.reduce((a,b)=>a+b.total,0),
  }), [rows]);

  if (!hasPermission("reporte_vencimientos_cxp") && !hasPermission("reporte_antiguedad_cxp")) {
    return <div className="p-6 text-sm text-gray-600">No tienes permiso para ver este reporte.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reporte de Vencimientos CxP</h2>

      <form onSubmit={(e)=>{e.preventDefault(); fetchData(1);}} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
          <AutocompleteProveedor value={proveedor} onChange={setProveedor} placeholder="RNC o nombre" /> 
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Fecha de corte</label>
          <input type="date" value={fechaCorte} onChange={e=>setFechaCorte(e.target.value)} className="w-full border rounded px-2 py-1"/>
        </div>
        <div className="flex items-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">Buscar</button>

          <button
  type="button"
  onClick={async () => {
    const params = new URLSearchParams({ proveedor, fechaCorte });
    const url = `/api/cxp/vencimientos/export?${params.toString()}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vencimientos_cxp_${fechaCorte}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }}
  className="ml-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
>
  Exportar CSV
</button>


<button
  type="button"
  onClick={() => {
    // crea una nueva ventana y “pinta” una tabla plana con los datos actuales
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const rowsHtml = rows.map(r => `
      <tr>
        <td>${r.proveedorNombre}</td>
        <td style="text-align:right">${r.noVencido.toFixed(2)}</td>
        <td style="text-align:right">${r.d0_30.toFixed(2)}</td>
        <td style="text-align:right">${r.d31_60.toFixed(2)}</td>
        <td style="text-align:right">${r.d61_90.toFixed(2)}</td>
        <td style="text-align:right">${r.d90p.toFixed(2)}</td>
        <td style="text-align:right">${r.total.toFixed(2)}</td>
        <td style="text-align:right">${r.facturas}</td>
      </tr>
    `).join("");

    w.document.write(`
      <html>
      <head>
        <title>Vencimientos CxP</title>
        <style>
          body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue"; padding: 16px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 4px; }
          th { background: #f4f4f5; text-align: right; }
          th:first-child, td:first-child { text-align: left; }
          h1 { font-size: 18px; margin: 0 0 8px; }
          .meta { color: #555; margin-bottom: 12px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reporte de Vencimientos CxP</h1>
        <div class="meta">Corte: <b>${fechaCorte}</b> ${proveedor ? '— Proveedor: <b>'+proveedor+'</b>' : ''}</div>
        <table>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>No vencido</th>
              <th>0–30</th>
              <th>31–60</th>
              <th>61–90</th>
              <th>&gt;90</th>
              <th>Total</th>
              <th># Docs</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `);
    w.document.close();
  }}
  className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
>
  Exportar PDF
</button>

        </div>
      </form>

      {err && <div className="rounded border border-red-200 bg-red-50 text-red-700 p-2 text-sm">{err}</div>}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Proveedor</th>
              <th className="px-3 py-2 text-right">No vencido</th>
              <th className="px-3 py-2 text-right">0–30</th>
              <th className="px-3 py-2 text-right">31–60</th>
              <th className="px-3 py-2 text-right">61–90</th>
              <th className="px-3 py-2 text-right">&gt;90</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right"># Docs</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-3 py-2">Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-3 py-2">Sin resultados</td></tr>}
            {!loading && rows.map(r => (
              <tr key={r.proveedorId} className="border-t">
                <td className="px-3 py-2">{r.proveedorNombre}</td>

                {/* celdas clickeables para abrir detalle */}
                <td className="px-3 py-2 text-right">
                  <button className="underline-offset-2 hover:underline" onClick={()=>openDetalle(r,"NoVencido")}>
                    {r.noVencido.toFixed(2)}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="underline-offset-2 hover:underline" onClick={()=>openDetalle(r,"0-30")}>
                    {r.d0_30.toFixed(2)}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="underline-offset-2 hover:underline" onClick={()=>openDetalle(r,"31-60")}>
                    {r.d31_60.toFixed(2)}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="underline-offset-2 hover:underline" onClick={()=>openDetalle(r,"61-90")}>
                    {r.d61_90.toFixed(2)}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="underline-offset-2 hover:underline" onClick={()=>openDetalle(r,">90")}>
                    {r.d90p.toFixed(2)}
                  </button>
                </td>

                <td className="px-3 py-2 text-right font-semibold">{r.total.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{r.facturas}</td>
              </tr>
            ))}
          </tbody>

          {/* Totales */}
          {!loading && rows.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr className="font-semibold">
                <td className="px-3 py-2 text-right">Totales:</td>
                <td className="px-3 py-2 text-right">{totalRow.noVencido.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{totalRow.d0_30.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{totalRow.d31_60.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{totalRow.d61_90.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{totalRow.d90p.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{totalRow.total.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>

        {/* Paginación */}
        <div className="flex items-center justify-between p-3 text-sm text-gray-600">
          <div>Mostrando {rows.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + rows.length} de {total}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={prev} disabled={page===1 || loading}>Anterior</button>
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={next} disabled={page*pageSize>=total || loading}>Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal detalle */}
      {detalle.open && detalle.proveedorId && detalle.bucket && (
        <DetalleModal
          proveedorId={detalle.proveedorId}
          proveedorNombre={detalle.proveedorNombre!}
          fechaCorte={fechaCorte}
          bucket={detalle.bucket}
          onClose={()=>setDetalle({open:false})}
        />
      )}
    </div>
  );
}
