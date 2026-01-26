
import { useEffect, useState } from "react";
import { fetchCxcCuentas, type CxcCuentaRow,  } from "../../assets/api/cxc";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function CuentasPorCobrarClientes() {
  useAuth();
  const nav = useNavigate();

  const [rows, setRows] = useState<CxcCuentaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [sumCobrar, setSumCobrar] = useState(0);
  const [sumDisp, setSumDisp] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //const [empresa, setEmpresa] = useState<CxcEmpresaClienteRow[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCxcCuentas({ search, page, pageSize });
      setRows(res.data);
      setTotal(res.total);
      setSumCobrar(res.sumTotalCobrar ?? 0);
      setSumDisp(res.sumTotalDisponible ?? 0);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      setError("No se pudo cargar CxC.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load();  }, [page]);

  const handleSearch = (ev: React.FormEvent) => {
    ev.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cuentas por Cobrar (por Empresas)</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Total a Cobrar (filtro): <span className="font-semibold">RD$ {sumCobrar.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Disponible (filtro): <span className="font-semibold">RD$ {sumDisp.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg shadow mb-4">
        <div className="md:col-span-3">
          <label className="block text-sm text-gray-600 mb-1">Buscar (RNC o Nombre)</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Ej. 101-xxxxxxxx / ACME"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </form>

      {error && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Empresa</th>
              <th className="text-left px-4 py-2">RNC</th>
              <th className="text-right px-4 py-2">Límite Crédito</th>
              <th className="text-right px-4 py-2">Total por Cobrar</th>
              <th className="text-right px-4 py-2">Disponible</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-4 py-3" colSpan={6}>Cargando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td className="px-4 py-3" colSpan={6}>Sin resultados</td></tr>
            )}
            {!loading && rows.map(r => (
              <tr key={r.clienteId} className="border-t">
                <td className="px-4 py-2">
                  <div className="font-medium">{r.clienteNombre}</div>
                  <div className="text-xs text-gray-500">{r.email ?? r.telefono ?? ""}</div>
                </td>
                <td className="px-4 py-2">{r.rnc}</td>
                <td className="px-4 py-2 text-right">{r.limiteCredito.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-semibold">{r.totalCobrar.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{r.totalDisponible.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    className="rounded-lg px-3 py-1.5 border hover:bg-gray-50"
                    onClick={() => nav(`/cxc/empresa/${r.clienteId}/clientes`)}   
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* paginación */}
        <div className="flex items-center justify-between p-3 text-sm text-gray-600">
          <span>
            Mostrando {rows.length ? (page - 1) * pageSize + 1 : 0}–
            {(page - 1) * pageSize + rows.length} de {total}
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Anterior</button>
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total || loading}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
