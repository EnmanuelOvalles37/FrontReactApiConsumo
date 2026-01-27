/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 // src/Paginas/Admin/AdminClientesAccesoPage.tsx
// Panel de administración de accesos de clientes

import { useState, useEffect } from "react";
import api from "../../Servicios/api";

interface ClienteAcceso {
  id: number;
  codigo: string;
  nombre: string;
  cedula: string | null;
  empresaNombre: string;
  saldoDisponible: number;
  limiteCredito: number;
  estadoAcceso: string;
  ultimoLoginUtc: string | null;
  contadorLoginsFallidos: number;
  bloqueadoHasta: string | null;
  accesoHabilitado: boolean;
}

interface Estadisticas {
  totalClientes: number;
  activos: number;
  bloqueados: number;
  deshabilitados: number;
  sinConfigurar: number;
  pendienteCambio: number;
  loginUltimos7Dias: number;
  loginUltimos30Dias: number;
}

interface Empresa {
  id: number;
  nombre: string;
}

export default function AdminClientesAccesoPage() {
  const [clientes, setClientes] = useState<ClienteAcceso[]>([]);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Filtros
  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState<string>("todos");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Selección múltiple
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    cargarEmpresas();
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [empresaId, estado, pagina]);

  const cargarEmpresas = async () => {
    try {
      const res = await api.get("/empresas");
      
      
      // Manejar diferentes formatos de respuesta
      let empresasArray: Empresa[] = [];
      
      if (Array.isArray(res.data)) {
        empresasArray = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        empresasArray = res.data.data;
      } else if (res.data && Array.isArray(res.data.empresas)) {
        empresasArray = res.data.empresas;
      } else if (res.data && Array.isArray(res.data.items)) {
        empresasArray = res.data.items;
      }
      
      setEmpresas(empresasArray);
    } catch (error) {
      console.error("Error cargando empresas:", error);
      setEmpresas([]);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const res = await api.get("/admin/clientes-acceso/estadisticas", {
        params: empresaId ? { empresaId } : {}
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      // Establecer estadísticas por defecto
      setStats({
        totalClientes: 0,
        activos: 0,
        bloqueados: 0,
        deshabilitados: 0,
        sinConfigurar: 0,
        pendienteCambio: 0,
        loginUltimos7Dias: 0,
        loginUltimos30Dias: 0
      });
    }
  };

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const params: any = { pagina, porPagina: 50 };
      if (empresaId) params.empresaId = empresaId;
      if (buscar) params.buscar = buscar;
      if (estado !== "todos") params.estado = estado;

      const res = await api.get("/admin/clientes-acceso", { params });
     
      
      // Manejar diferentes formatos de respuesta
      let clientesArray: ClienteAcceso[] = [];
      let total = 1;
      
      if (Array.isArray(res.data)) {
        clientesArray = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        clientesArray = res.data.data;
        total = res.data.totalPaginas || 1;
      } else if (res.data && Array.isArray(res.data.clientes)) {
        clientesArray = res.data.clientes;
        total = res.data.totalPaginas || 1;
      } else if (res.data && Array.isArray(res.data.items)) {
        clientesArray = res.data.items;
        total = res.data.totalPaginas || 1;
      }
      
      setClientes(clientesArray);
      setTotalPaginas(total);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarClientes = () => {
    setPagina(1);
    cargarClientes();
  };

  const resetearContrasena = async (id: number, nombre: string) => {
    if (!confirm(`¿Resetear la contraseña de ${nombre}?\n\nLa nueva contraseña será: 123456`)) return;

    try {
      setActionLoading(id);
      await api.post(`/admin/clientes-acceso/${id}/resetear-contrasena`);
      alert(`Contraseña reseteada. Nueva contraseña: 123456`);
      cargarClientes();
      cargarEstadisticas();
    } catch (error) {
      alert("Error al resetear contraseña");
    } finally {
      setActionLoading(null);
    }
  };

  const desbloquearCuenta = async (id: number) => {
    try {
      setActionLoading(id);
      await api.post(`/admin/clientes-acceso/${id}/desbloquear`);
      cargarClientes();
      cargarEstadisticas();
    } catch (error) {
      alert("Error al desbloquear cuenta");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAcceso = async (id: number, nombre: string, habilitado: boolean) => {
    const accion = habilitado ? "deshabilitar" : "habilitar";
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} el acceso de ${nombre}?`)) return;

    try {
      setActionLoading(id);
      await api.post(`/admin/clientes-acceso/${id}/toggle-acceso`);
      cargarClientes();
      cargarEstadisticas();
    } catch (error) {
      alert("Error al cambiar estado de acceso");
    } finally {
      setActionLoading(null);
    }
  };

  const resetearMasivo = async () => {
    if (seleccionados.length === 0) {
      alert("Seleccione al menos un cliente");
      return;
    }
    if (!confirm(`¿Resetear contraseña de ${seleccionados.length} clientes?\n\nNueva contraseña: 123456`)) return;

    try {
      setLoading(true);
      await api.post("/admin/clientes-acceso/resetear-masivo", { clienteIds: seleccionados });
      alert(`Contraseñas reseteadas para ${seleccionados.length} clientes`);
      setSeleccionados([]);
      cargarClientes();
      cargarEstadisticas();
    } catch (error) {
      alert("Error en reseteo masivo");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estilos: Record<string, string> = {
      activo: "bg-green-100 text-green-700",
      bloqueado: "bg-red-100 text-red-700",
      deshabilitado: "bg-gray-100 text-gray-700",
      sin_configurar: "bg-yellow-100 text-yellow-700",
      pendiente_cambio: "bg-blue-100 text-blue-700"
    };
    const labels: Record<string, string> = {
      activo: "Activo",
      bloqueado: "Bloqueado",
      deshabilitado: "Deshabilitado",
      sin_configurar: "Sin configurar",
      pendiente_cambio: "Pendiente cambio"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estilos[estado] || "bg-gray-100"}`}>
        {labels[estado] || estado}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === clientes.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(clientes.map(c => c.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Accesos</h1>
          <p className="text-gray-500">Administrar acceso de empleados al sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
            <p className="text-xs text-gray-500">Activos</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-red-600">{stats.bloqueados}</p>
            <p className="text-xs text-gray-500">Bloqueados</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-gray-600">{stats.deshabilitados}</p>
            <p className="text-xs text-gray-500">Deshabilitados</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-yellow-600">{stats.sinConfigurar}</p>
            <p className="text-xs text-gray-500">Sin configurar</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-blue-600">{stats.pendienteCambio}</p>
            <p className="text-xs text-gray-500">Pendiente cambio</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-indigo-600">{stats.loginUltimos7Dias}</p>
            <p className="text-xs text-gray-500">Login 7 días</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-2xl font-bold text-purple-600">{stats.loginUltimos30Dias}</p>
            <p className="text-xs text-gray-500">Login 30 días</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => { setEmpresaId(e.target.value ? parseInt(e.target.value) : ""); setPagina(1); }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Todas</option>
              {empresas && empresas.length > 0 && empresas.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="bloqueados">Bloqueados</option>
              <option value="sinAcceso">Deshabilitados</option>
              <option value="pendientes">Pendiente configurar</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nombre, cédula o código..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarClientes()}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button onClick={buscarClientes} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Buscar
          </button>
        </div>
      </div>

      {/* Acciones masivas */}
      {seleccionados.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-indigo-700 font-medium">
            {seleccionados.length} cliente(s) seleccionado(s)
          </p>
          <div className="flex gap-2">
            <button
              onClick={resetearMasivo}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              🔄 Resetear contraseñas
            </button>
            <button
              onClick={() => setSeleccionados([])}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={seleccionados.length === clientes.length && clientes.length > 0}
                  onChange={seleccionarTodos}
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Cliente</th>
              <th className="px-4 py-3 text-left font-semibold">Cédula</th>
              <th className="px-4 py-3 text-left font-semibold">Empresa</th>
              <th className="px-4 py-3 text-center font-semibold">Estado</th>
              <th className="px-4 py-3 text-left font-semibold">Último Login</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    Cargando...
                  </div>
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(c.id)}
                      onChange={() => toggleSeleccion(c.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.nombre}</p>
                    <p className="text-xs text-gray-500">{c.codigo}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.cedula || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.empresaNombre}</td>
                  <td className="px-4 py-3 text-center">{getEstadoBadge(c.estadoAcceso)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(c.ultimoLoginUtc)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => resetearContrasena(c.id, c.nombre)}
                        disabled={actionLoading === c.id}
                        className="p-2 hover:bg-amber-100 rounded-lg text-amber-600"
                        title="Resetear contraseña"
                      >
                        🔄
                      </button>
                      {c.estadoAcceso === "bloqueado" && (
                        <button
                          onClick={() => desbloquearCuenta(c.id)}
                          disabled={actionLoading === c.id}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                          title="Desbloquear"
                        >
                          🔓
                        </button>
                      )}
                      <button
                        onClick={() => toggleAcceso(c.id, c.nombre, c.accesoHabilitado)}
                        disabled={actionLoading === c.id}
                        className={`p-2 rounded-lg ${c.accesoHabilitado ? "hover:bg-red-100 text-red-600" : "hover:bg-green-100 text-green-600"}`}
                        title={c.accesoHabilitado ? "Deshabilitar acceso" : "Habilitar acceso"}
                      >
                        {c.accesoHabilitado ? "🚫" : "✅"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}