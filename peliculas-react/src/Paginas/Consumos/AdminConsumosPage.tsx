import { useEffect, useState } from "react";
import axios from "axios";

type Consumo = {
  id: number;
  fecha: string;
  proveedorId: number;
  proveedorNombre: string;
  tiendaId: number;
  tiendaNombre: string;
  cajaId: number;
  cajaNombre: string;
  clienteId: number;
  clienteNombre: string;
  clienteCedula: string;
  empresaId: number;
  monto: number;
  concepto?: string;
  referencia?: string;
  reversado: boolean;
  usuarioRegistradorId: number;
  usuarioRegistrador: string;
};

type Estadisticas = {
  estadisticas: {
    totalConsumos: number;
    montoTotal: number;
    promedio: number;
    clientesUnicos: number;
    proveedoresActivos: number;
  };
  porProveedor: Array<{
    proveedorId: number;
    proveedorNombre: string;
    totalConsumos: number;
    montoTotal: number;
    promedio: number;
    clientesUnicos: number;
  }>;
};

export default function AdminConsumosPage() {
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const [cajaId, setCajaId] = useState<number | null>(null);
  const [clienteCedula, setClienteCedula] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Tabs
  const [activeTab, setActiveTab] = useState<"lista" | "estadisticas">("lista");

  // Datos para selects
  const [proveedores, setProveedores] = useState<Array<{ id: number; nombre: string }>>([]);

  // Total y monto
  const [totalConsumos, setTotalConsumos] = useState(0);
  const [, setMontoTotal] = useState(0);

  useEffect(() => {
    loadProveedores();
    setFechasDefecto();
  }, []);

  useEffect(() => {
    if (desde && hasta) {
      loadConsumos();
      loadEstadisticas();
    }
  }, [desde, hasta, proveedorId, tiendaId, cajaId, clienteCedula, page]);

  const setFechasDefecto = () => {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    setHasta(hoy.toISOString().split("T")[0]);
    setDesde(hace30Dias.toISOString().split("T")[0]);
  };

  const loadProveedores = async () => {
    try {
      const response = await axios.get("/api/proveedores");
      setProveedores(response.data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  };

  const loadConsumos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (proveedorId) params.append("proveedorId", proveedorId.toString());
      if (tiendaId) params.append("tiendaId", tiendaId.toString());
      if (cajaId) params.append("cajaId", cajaId.toString());
      if (clienteCedula) params.append("clienteCedula", clienteCedula);
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());

      const response = await axios.get(`/api/admin/consumos?${params}`);
      setConsumos(response.data.data);
      setTotalConsumos(response.data.total);
      setMontoTotal(response.data.montoTotal);
    } catch (error) {
      console.error("Error cargando consumos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const response = await axios.get(`/api/admin/consumos/estadisticas?${params}`);
      setEstadisticas(response.data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const limpiarFiltros = () => {
    setProveedorId(null);
    setTiendaId(null);
    setCajaId(null);
    setClienteCedula("");
    setPage(1);
  };

  const setFechaRapida = (dias: number) => {
    const hoy = new Date();
    const desde = new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000);
    setDesde(desde.toISOString().split("T")[0]);
    setHasta(hoy.toISOString().split("T")[0]);
    setPage(1);
  };

  const totalPages = Math.ceil(totalConsumos / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Consumos del Sistema</h1>
          <p className="text-gray-600 mt-1">
            Panel de administración de todos los consumos registrados
          </p>
        </div>

        {/* Stats generales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Total Consumos</div>
              <div className="text-3xl font-bold text-sky-600">
                {estadisticas.estadisticas.totalConsumos}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Monto Total</div>
              <div className="text-3xl font-bold text-green-600">
                RD${estadisticas.estadisticas.montoTotal.toLocaleString("es-DO", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Promedio</div>
              <div className="text-3xl font-bold text-purple-600">
                RD${estadisticas.estadisticas.promedio.toLocaleString("es-DO", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Clientes Únicos</div>
              <div className="text-3xl font-bold text-orange-600">
                {estadisticas.estadisticas.clientesUnicos}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Proveedores Activos</div>
              <div className="text-3xl font-bold text-pink-600">
                {estadisticas.estadisticas.proveedoresActivos}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => {
                  setDesde(e.target.value);
                  setPage(1);
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => {
                  setHasta(e.target.value);
                  setPage(1);
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Proveedor</label>
              <select
                value={proveedorId || ""}
                onChange={(e) => {
                  setProveedorId(e.target.value ? Number(e.target.value) : null);
                  setPage(1);
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cédula Cliente</label>
              <input
                type="text"
                value={clienteCedula}
                onChange={(e) => {
                  setClienteCedula(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar..."
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setFechaRapida(7)}
                className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                Últimos 7 días
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm w-full"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
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
              onClick={() => setActiveTab("estadisticas")}
              className={`px-6 py-3 font-medium ${
                activeTab === "estadisticas"
                  ? "border-b-2 border-sky-600 text-sky-600"
                  : "text-gray-500"
              }`}
            >
              Estadísticas por Proveedor
            </button>
          </div>

          {/* Lista */}
          {activeTab === "lista" && (
            <div>
              {loading ? (
                <div className="p-12 text-center">Cargando...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Fecha</th>
                          <th className="px-4 py-2 text-left">Proveedor</th>
                          <th className="px-4 py-2 text-left">Tienda</th>
                          <th className="px-4 py-2 text-left">Caja</th>
                          <th className="px-4 py-2 text-left">Cliente</th>
                          <th className="px-4 py-2 text-left">Cédula</th>
                          <th className="px-4 py-2 text-right">Monto</th>
                          <th className="px-4 py-2 text-left">Registrado por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumos.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                              No hay consumos en el rango seleccionado
                            </td>
                          </tr>
                        )}
                        {consumos.map((consumo) => (
                          <tr key={consumo.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2 text-xs">
                              {new Date(consumo.fecha).toLocaleString("es-DO")}
                            </td>
                            <td className="px-4 py-2 text-xs font-medium">
                              {consumo.proveedorNombre}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {consumo.tiendaNombre}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {consumo.cajaNombre}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {consumo.clienteNombre}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {consumo.clienteCedula}
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              RD${consumo.monto.toLocaleString("es-DO", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {consumo.usuarioRegistrador}
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
                        Página {page} de {totalPages} ({totalConsumos} consumos)
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

          {/* Estadísticas */}
          {activeTab === "estadisticas" && estadisticas && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Proveedor</th>
                    <th className="px-4 py-2 text-right">Consumos</th>
                    <th className="px-4 py-2 text-right">Monto Total</th>
                    <th className="px-4 py-2 text-right">Promedio</th>
                    <th className="px-4 py-2 text-right">Clientes Únicos</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticas.porProveedor.map((prov) => (
                    <tr key={prov.proveedorId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{prov.proveedorNombre}</td>
                      <td className="px-4 py-2 text-right">{prov.totalConsumos}</td>
                      <td className="px-4 py-2 text-right font-bold">
                        RD${prov.montoTotal.toLocaleString("es-DO", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        RD${prov.promedio.toLocaleString("es-DO", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-2 text-right">{prov.clientesUnicos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}