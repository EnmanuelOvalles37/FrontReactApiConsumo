import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type Consumo = {
  id: number;
  fecha: string;
  clienteNombre: string;
  clienteCedula: string;
  empresaNombre: string;
  monto: number;
  concepto?: string;
  referencia?: string;
  reversado: boolean;
  usuarioRegistrador: string;
};

type ConsumosPorDia = {
  fecha: string;
  cantidad: number;
  total: number;
};

export default function CajaDetailPage() {
  const { id, tiendaId, cajaId } = useParams<{
    id: string;
    tiendaId: string;
    cajaId: string;
  }>();
  const navigate = useNavigate();

  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [porDia, setPorDia] = useState<ConsumosPorDia[]>([]);
  const [montoTotal, setMontoTotal] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Tabs
  const [activeTab, setActiveTab] = useState<"lista" | "pordia">("lista");

  const loadConsumos = useCallback(async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    const res = await axios.get(`/api/cajas/${cajaId}/consumos?${params.toString()}`);
    setConsumos(res.data.data);
    setMontoTotal(res.data.montoTotal);
    setTotalRegistros(res.data.total);
  } catch (error) {
    console.error("Error cargando consumos:", error);
  } finally {
    setLoading(false);
  }
}, [cajaId, desde, hasta, page, pageSize]); // <- incluir TODAS las variables que usa la función

const loadPorDia = useCallback(async () => {
  try {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);

    const res = await axios.get(`/api/cajas/${cajaId}/consumos/por-dia?${params.toString()}`);
    setPorDia(res.data);
  } catch (error) {
    console.error("Error cargando stats por día:", error);
  }
}, [cajaId, desde, hasta]); // <- deps de esta función

useEffect(() => {
  loadConsumos();
  loadPorDia();
}, [loadConsumos, loadPorDia]);

  const totalPages = Math.ceil(totalRegistros / pageSize);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Consumos de Caja</h2>
          <p className="text-sm text-gray-500">Detalle de transacciones</p>
        </div>
        <button
          onClick={() => navigate(`/proveedores/${id}/tiendas/${tiendaId}`)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Registros</div>
          <div className="text-3xl font-bold text-sky-600">{totalRegistros}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Monto Total</div>
          <div className="text-3xl font-bold text-green-600">
            ${montoTotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => {
                setDesde(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => {
                setHasta(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={() => {
              setDesde("");
              setHasta("");
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow mb-6">
        <div className="border-b flex">
          <button
            onClick={() => setActiveTab("lista")}
            className={`px-6 py-3 font-medium ${
              activeTab === "lista"
                ? "border-b-2 border-sky-600 text-sky-600"
                : "text-gray-500"
            }`}
          >
            Lista de Consumos
          </button>
          <button
            onClick={() => setActiveTab("pordia")}
            className={`px-6 py-3 font-medium ${
              activeTab === "pordia"
                ? "border-b-2 border-sky-600 text-sky-600"
                : "text-gray-500"
            }`}
          >
            Por Día
          </button>
        </div>

        {/* Lista de Consumos */}
        {activeTab === "lista" && (
          <div>
            {loading ? (
              <div className="p-6 text-center">Cargando...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Fecha</th>
                        <th className="px-4 py-2 text-left">Cliente</th>
                        <th className="px-4 py-2 text-left">Cédula</th>
                        <th className="px-4 py-2 text-left">Empresa</th>
                        <th className="px-4 py-2 text-right">Monto</th>
                        <th className="px-4 py-2 text-left">Registrado por</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consumos.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 text-center text-gray-500">
                            Sin registros
                          </td>
                        </tr>
                      )}
                      {consumos.map((c) => (
                        <tr key={c.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {new Date(c.fecha).toLocaleDateString("es-DO")}
                          </td>
                          <td className="px-4 py-2">{c.clienteNombre}</td>
                          <td className="px-4 py-2">{c.clienteCedula}</td>
                          <td className="px-4 py-2">{c.empresaNombre}</td>
                          <td className="px-4 py-2 text-right font-medium">
                            ${c.monto.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {c.usuarioRegistrador}
                          </td>
                          <td className="px-4 py-2">
                            {c.reversado ? (
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                                Reversado
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                                Activo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="p-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Página {page} de {totalPages} ({totalRegistros} registros)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Por Día */}
        {activeTab === "pordia" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-right">Cantidad</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {porDia.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                      Sin datos
                    </td>
                  </tr>
                )}
                {porDia.map((d, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(d.fecha).toLocaleDateString("es-DO", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2 text-right">{d.cantidad}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      ${d.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {porDia.length > 0 && (
                  <tr className="border-t bg-gray-50 font-semibold">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2 text-right">
                      {porDia.reduce((sum, d) => sum + d.cantidad, 0)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${porDia
                        .reduce((sum, d) => sum + d.total, 0)
                        .toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}