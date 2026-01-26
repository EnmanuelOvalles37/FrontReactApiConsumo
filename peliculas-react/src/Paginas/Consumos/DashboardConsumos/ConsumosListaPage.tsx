// src/Paginas/Consumos/ConsumosListaPage.tsx
// Listado de consumos con filtros avanzados

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../Servicios/api";


interface Consumo {
  id: number;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  clienteCedula: string | null;
  empresaId: number;
  empresaNombre: string;
  proveedorId: number;
  proveedorNombre: string;
  tiendaId: number | null;
  tiendaNombre: string | null;
  monto: number;
  concepto: string | null;
  referencia: string | null;
  reversado: boolean;
  reversadoUtc: string | null;
  registradoPor: string | null;
}

interface Empresa {
  id: number;
  nombre: string;
}

interface Proveedor {
  id: number;
  nombre: string;
}

export default function ConsumosListaPage() {
  const [searchParams] = useSearchParams();
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({ totalConsumos: 0, montoActivo: 0, montoReversado: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 0 });

  // Filtros - leer soloMisConsumos de URL
  const [soloMisConsumos] = useState(searchParams.get("soloMisConsumos") === "true");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [soloReversados, setSoloReversados] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);

  // Datos para selects
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    loadSelects();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadSelects = async () => {
    try {
      const [empRes, provRes] = await Promise.all([
        api.get("/empresas"),
        api.get("/proveedores")
      ]);
      setEmpresas(empRes.data.data || empRes.data || []);
      setProveedores(provRes.data.data || provRes.data || []);
    } catch (error) {
      console.error("Error cargando selects:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (empresaId) params.append("empresaId", empresaId);
      if (proveedorId) params.append("proveedorId", proveedorId);
      if (soloReversados) params.append("soloReversados", "true");
      if (soloMisConsumos) params.append("soloMisConsumos", "true");
      if (busqueda) params.append("busqueda", busqueda);
      params.append("page", page.toString());
      params.append("pageSize", "20");

      const { data: result } = await api.get(`/modulo-consumos/lista?${params}`);
      setConsumos(result.data || []);
      setResumen(result.resumen || { totalConsumos: 0, montoActivo: 0, montoReversado: 0 });
      setPagination(result.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 });
    } catch (error) {
      console.error("Error cargando consumos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPage(1);
    loadData();
  };

  const handleLimpiar = () => {
    setDesde("");
    setHasta("");
    setEmpresaId("");
    setProveedorId("");
    setSoloReversados(false);
    setBusqueda("");
    setPage(1);
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-DO");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <span className="text-gray-900">{soloMisConsumos ? "Mis Consumos" : "Lista"}</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {soloMisConsumos ? "Mis Consumos Registrados" : "Lista de Consumos"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {soloMisConsumos 
                ? "Consumos que has registrado como cajero" 
                : "Todos los consumos con filtros avanzados"}
            </p>
          </div>
          <Link
            to="/consumos/nuevo"
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
          >
            ➕ Registrar Consumo
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todos</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, cédula..."
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500"
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={soloReversados}
                onChange={(e) => setSoloReversados(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Solo reversados</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBuscar}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
          >
            🔍 Buscar
          </button>
          <button
            onClick={handleLimpiar}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-3 text-center">
          <p className="text-sm text-gray-500">Total Consumos</p>
          <p className="text-xl font-bold">{resumen.totalConsumos}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-3 text-center">
          <p className="text-sm text-green-600">Monto Activo</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(resumen.montoActivo)}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-3 text-center">
          <p className="text-sm text-red-600">Monto Reversado</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(resumen.montoReversado)}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Empresa</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Proveedor</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Concepto</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {consumos.length > 0 ? (
                    consumos.map((consumo) => (
                      <tr key={consumo.id} className={`hover:bg-gray-50 ${consumo.reversado ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatDateTime(consumo.fecha)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{consumo.clienteNombre}</p>
                          {consumo.clienteCedula && (
                            <p className="text-xs text-gray-400">{consumo.clienteCedula}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{consumo.empresaNombre}</td>
                        <td className="px-4 py-3">
                          <p>{consumo.proveedorNombre}</p>
                          {consumo.tiendaNombre && (
                            <p className="text-xs text-gray-400">{consumo.tiendaNombre}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">
                          {consumo.concepto || "-"}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${consumo.reversado ? 'text-red-500 line-through' : 'text-gray-900'}`}>
                          {formatCurrency(consumo.monto)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {consumo.reversado ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                              Reversado
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/modulo-consumos/${consumo.id}`}
                            className="text-sky-600 hover:underline text-sm"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No se encontraron consumos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {(page - 1) * 20 + 1} - {Math.min(page * 20, pagination.total)} de {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                  >
                    ← Anterior
                  </button>
                  <span className="px-3 py-1">
                    Página {page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}