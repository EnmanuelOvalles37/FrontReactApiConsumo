import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../Servicios/api";

interface ProveedorConsumo {
  proveedorId: number;
  proveedorNombre: string;
  totalConsumos: number;
  montoActivo: number;
  montoReversado: number;
  tiendasActivas: number;
  empresasAtendidas: number;
}

export default function ConsumosPorProveedorPage() {
  const [proveedores, setProveedores] = useState<ProveedorConsumo[]>([]);
  const [loading, setLoading] = useState(true);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const { data: result } = await api.get(`/modulo-consumos/por-proveedor?${params}`);
      setProveedores(result.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    loadData();
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const totalMonto = proveedores.reduce((acc, p) => acc + p.montoActivo, 0);
  const totalConsumos = proveedores.reduce((acc, p) => acc + p.totalConsumos, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <span className="text-gray-900">Por Proveedor</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Consumos por Proveedor</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de consumos agrupados por proveedor/tienda</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={handleBuscar}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
          >
            🔍 Filtrar
          </button>
          <button
            onClick={() => { setDesde(""); setHasta(""); loadData(); }}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Proveedores</p>
          <p className="text-2xl font-bold">{proveedores.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Consumos</p>
          <p className="text-2xl font-bold">{totalConsumos}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-4 text-center">
          <p className="text-sm text-green-600">Monto Total</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalMonto)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Proveedor</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Consumos</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Monto Activo</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Monto Reversado</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Tiendas</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Empresas</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proveedores.length > 0 ? (
                  proveedores.map((prov) => (
                    <tr key={prov.proveedorId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/proveedores/${prov.proveedorId}`} className="font-medium text-sky-600 hover:underline">
                          {prov.proveedorNombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">{prov.totalConsumos}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">
                        {formatCurrency(prov.montoActivo)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {prov.montoReversado > 0 ? formatCurrency(prov.montoReversado) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">{prov.tiendasActivas}</td>
                      <td className="px-4 py-3 text-right">{prov.empresasAtendidas}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/modulo-consumos/lista?proveedorId=${prov.proveedorId}`}
                          className="text-sky-600 hover:underline text-sm"
                        >
                          Ver consumos
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron datos
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