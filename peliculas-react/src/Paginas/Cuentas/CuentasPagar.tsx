// Paginas/Cuentas/CuentasPagar.tsx
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { CxpItem, CxpResponse } from "../../assets/types/cxp";
import { useAuth } from "../../Context/AuthContext";
import ApplyPagoModal from "./ApplyPagoModal";

export default function CuentasPagar() {
  const { hasPermission } = useAuth();

  // filtros
  const [proveedor, setProveedor] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [estado, setEstado] = useState<string>("");

  // tabla
  const [rows, setRows] = useState<CxpItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sumBalance, setSumBalance] = useState(0);
  const [sumBalanceAll, setSumBalanceAll] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modal
  const [openPago, setOpenPago] = useState<{ open: boolean; row: CxpItem | null }>({
    open: false,
    row: null,
  });

  // ------------------------------
  // 1) FETCH CENTRALIZADO
  // ------------------------------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        proveedor: proveedor || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
        estado: estado || undefined,
        page,
        pageSize,
      };

      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { };
      if (token) headers.Authorization = `Bearer ${token}`;

      const { data } = await axios.get<CxpResponse>("/api/cxp", { params, headers });

      setRows(data.data ?? []);
      setTotal(data.total ?? 0);
      setSumBalance(data.sumBalance ?? 0);
      setSumBalanceAll(data.sumBalanceAll ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.response?.data ?? e?.message ?? "No se pudo cargar la data");
    } finally {
      setLoading(false);
    }
  }, [proveedor, desde, hasta, estado, page, pageSize]);

  // cargar al entrar y cuando cambien los deps
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ------------------------------
  // 2) HANDLERS
  // ------------------------------
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchData();
  };

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(1, p - 1));

  // será llamado por el modal cuando el POST termine OK
  const onPagoSuccess = async () => {
    // opción A: simplemente refetch para recalcular totales y estado
    await fetchData();

    // opción B (optimista): si tu backend devolviera { nuevoBalance }, podrías:
    // setRows(prev => prev.map(r => r.id === openPago.row!.id
    //   ? { ...r, balance: nuevoBalance, estado: nuevoBalance <= 0 ? "Pagado" : (nuevoBalance < r.monto ? "Parcial" : "Pendiente") }
    //   : r
    // ));
    // y luego cerrar el modal:
    setOpenPago({ open: false, row: null });
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cuentas por Pagar</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Balance (página): <span className="font-semibold">${sumBalance.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Balance (total filtro): <span className="font-semibold">${sumBalanceAll.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 rounded-lg shadow mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
          <input
            value={proveedor}
            onChange={e => setProveedor(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Nombre o ID"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Estado</label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Parcial">Parcial</option>
            <option value="Pagado">Pagado</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          {/* ejemplo export */}
          {/* <button type="button" onClick={exportCsv} className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800 disabled:opacity-50" disabled={rows.length === 0}>
            Exportar CSV
          </button> */}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Proveedor</th>
              <th className="text-left px-4 py-2">Documento</th>
              <th className="text-left px-4 py-2">Concepto</th>
              <th className="text-right px-4 py-2">Monto</th>
              <th className="text-right px-4 py-2">Balance</th>
              <th className="text-center px-4 py-2">Estado</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-3" colSpan={8}>Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td className="px-4 py-3" colSpan={8}>Sin resultados</td></tr>}
            {!loading && rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{new Date(r.fecha).toLocaleDateString()}</td>
                <td className="px-4 py-2">{r.proveedorNombre}</td>
                <td className="px-4 py-2">{r.documento}</td>
                <td className="px-4 py-2">{r.concepto ?? ""}</td>
                <td className="px-4 py-2 text-right">{r.monto.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-semibold">{r.balance.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    r.estado === "Pagado" ? "bg-green-100 text-green-700"
                    : r.estado === "Parcial" ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}>{r.estado}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    disabled={r.estado === "Pagado" || r.balance <= 0 || !hasPermission("registrar_pago")}
                    onClick={() => setOpenPago({ open: true, row: r })}
                    className="rounded-lg px-3 py-1.5 text-white text-sm bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700"
                  >
                    Aplicar pago
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex items-center justify-between p-3 text-sm text-gray-600">
          <span>
            Mostrando {rows.length ? (page - 1) * pageSize + 1 : 0}
            –{(page - 1) * pageSize + rows.length} de {total}
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={prevPage} disabled={page === 1 || loading}>
              Anterior
            </button>
            <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={nextPage} disabled={page * pageSize >= total || loading}>
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openPago.open && openPago.row && (
        <ApplyPagoModal
          row={openPago.row}
          onClose={() => setOpenPago({ open: false, row: null })}
          onSuccess={onPagoSuccess}
        />
      )}
    </div>
  );
}
