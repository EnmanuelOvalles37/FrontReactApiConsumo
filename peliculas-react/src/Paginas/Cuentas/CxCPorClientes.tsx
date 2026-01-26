import { useEffect, useState } from "react";
import { useParams, useNavigate, } from "react-router-dom";
import {
  fetchCxcEmpresaClientes,
  type CxcEmpresaClienteRow,
} from "../../assets/api/cxc";

export default function CxcEmpresaDetail() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const nav = useNavigate();

  const [rows, setRows] = useState<CxcEmpresaClienteRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sumCobrar, setSumCobrar] = useState(0);
  const [sumDisp, setSumDisp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!empresaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCxcEmpresaClientes({
        empresaId: Number(empresaId),
        search,
        page,
        pageSize,
      });
      setRows(res.data);
      setTotal(res.total);
      setSumCobrar(res.sumTotalCobrar ?? 0);
      setSumDisp(res.sumTotalDisponible ?? 0);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el detalle de CxC por clientes.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">CxC · Empleados de la Empresa</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Total a Cobrar: <span className="font-semibold">RD$ {sumCobrar.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Disponible: <span className="font-semibold">RD$ {sumDisp.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg shadow mb-4">
        <div className="md:col-span-3">
          <label className="block text-sm text-gray-600 mb-1">Buscar (código, nombre o cédula)</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Ej. C-0001 / Juan / 001-..."
          />
        </div>
        <div className="flex items-end">
          <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </form>

      {error && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Código</th>
              <th className="text-left px-4 py-2">Cliente</th>
              <th className="text-left px-4 py-2">Cédula</th>
              <th className="text-center px-4 py-2">Día Corte</th>
              <th className="text-right px-4 py-2">Saldo Original</th>
              <th className="text-right px-4 py-2">Total por Cobrar</th>
              <th className="text-right px-4 py-2">Disponible</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-3">Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-3">Sin resultados</td></tr>}
            {!loading && rows.map(r => (
              <tr key={r.clienteId} className="border-t">
                <td className="px-4 py-2">{r.codigo}</td>
                <td className="px-4 py-2">{r.clienteNombre}</td>
                <td className="px-4 py-2">{r.cedula}</td>
                <td className="px-4 py-2 text-center">{r.diaCorte}</td>
                <td className="px-4 py-2 text-right">{r.saldoOriginal.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-semibold">{r.totalCobrar.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{r.totalDisponible.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">
                  {/* Salto al DETALLE por documentos del cliente */}
                  <button
                    className="rounded-lg px-3 py-1.5 border hover:bg-gray-50"
                    onClick={() => nav(`/cxc?clienteId=${r.empresaId}`)}
                  >
                    Ver documentos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between p-3 text-sm text-gray-600">
          <span>
            Mostrando {rows.length ? (page - 1) * pageSize + 1 : 0}–
            {(page - 1) * pageSize + rows.length} de {total}
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}>
              Anterior
            </button>
            <button className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= total || loading}>
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
