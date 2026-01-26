/*// src/Paginas/Pagos/Refinanciamientos/RefinanciamientosListPage.tsx
// Lista de refinanciamientos activos

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../Servicios/api";


type Refinanciamiento = {
  id: number;
  documentoId: number;
  documentoNumero: string;
  empresaId: number;
  empresaNombre: string;
  montoRefinanciado: number;
  montoPagado: number;
  montoPendiente: number;
  fechaRefinanciamiento: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estado: number;
  estadoNombre: string;
};

export default function RefinanciamientosListPage() {
  const navigate = useNavigate();
  const [refinanciamientos, setRefinanciamientos] = useState<Refinanciamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("activos");

  useEffect(() => {
    loadRefinanciamientos();
  }, [filtroEstado]);

  const loadRefinanciamientos = async () => {
    try {
      setLoading(true);
      let url = "/refinanciamiento";
      if (filtroEstado === "activos") url += "?estado=0";
      else if (filtroEstado === "vencidos") url += "?estado=2";
      else if (filtroEstado === "pagados") url += "?estado=1";
      
      const res = await api.get(url);
const data = res.data;

if (Array.isArray(data)) {
  setRefinanciamientos(data);
} else if (data.data && Array.isArray(data.data)) {
  setRefinanciamientos(data.data);
} else if (data.refinanciamientos && Array.isArray(data.refinanciamientos)) {
  setRefinanciamientos(data.refinanciamientos);
} else {
  console.warn("Formato de refinanciamientos no reconocido:", data);
  setRefinanciamientos([]);
}
    } catch (error) {
      console.error("Error cargando refinanciamientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");

  const getEstadoStyle = (estado: number, diasRestantes: number) => {
    if (estado === 1) return "bg-green-100 text-green-700"; // Pagado
    if (estado === 2) return "bg-red-100 text-red-700"; // Vencido
    if (diasRestantes <= 7) return "bg-amber-100 text-amber-700"; // Próximo a vencer
    return "bg-sky-100 text-sky-700"; // Activo
  };

  const totales = {
    activos: refinanciamientos.filter(r => r.estado === 0).length,
    vencidos: refinanciamientos.filter(r => r.estado === 2).length,
    montoPendiente: refinanciamientos.reduce((sum, r) => sum + r.montoPendiente, 0)
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando refinanciamientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header /}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">
              💰 Pagos
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Refinanciamientos</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">🔄 Refinanciamientos</h1>
          <p className="text-gray-500 mt-1">Deudas refinanciadas de empresas</p>
        </div>
      </div>

      {/* Info box /}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-medium text-purple-800">¿Qué es un refinanciamiento?</p>
            <p className="text-sm text-purple-700 mt-1">
              Cuando una empresa no puede pagar su deuda, puedes refinanciarla. 
              Esto restablece el crédito de sus empleados y da 30 días adicionales para pagar.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas resumen /}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-xl font-bold text-gray-900">{totales.activos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vencidos</p>
              <p className="text-xl font-bold text-red-600">{totales.vencidos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto Pendiente</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totales.montoPendiente)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros /}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroEstado("activos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "activos"
                ? "bg-sky-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltroEstado("vencidos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "vencidos"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Vencidos
          </button>
          <button
            onClick={() => setFiltroEstado("pagados")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "pagados"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pagados
          </button>
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "todos"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Lista /}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {refinanciamientos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin refinanciamientos</h3>
            <p className="text-gray-500">No hay refinanciamientos en este estado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Empresa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Documento</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Monto</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Pendiente</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Vencimiento</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refinanciamientos.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-semibold">
                          {ref.empresaNombre.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{ref.empresaNombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{ref.documentoNumero}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(ref.montoRefinanciado)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(ref.montoPendiente)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <span className="block text-gray-900">{formatDate(ref.fechaVencimiento)}</span>
                        <span className={`text-xs ${ref.diasRestantes < 0 ? "text-red-600" : ref.diasRestantes <= 7 ? "text-amber-600" : "text-gray-500"}`}>
                          {ref.diasRestantes < 0 
                            ? `Vencido hace ${Math.abs(ref.diasRestantes)} días` 
                            : ref.diasRestantes === 0 
                              ? "Vence hoy"
                              : `${ref.diasRestantes} días restantes`
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoStyle(ref.estado, ref.diasRestantes)}`}>
                        {ref.estadoNombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/pagos/refinanciamientos/${ref.id}`)}
                          className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                        >
                          Ver
                        </button>
                        {ref.estado !== 1 && (
                          <button
                            onClick={() => navigate(`/pagos/refinanciamientos/${ref.id}/pagar`)}
                            className="px-3 py-1.5 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
                          >
                            Pagar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}*/

///////////////////////////

// src/Paginas/Pagos/Refinanciamientos/RefinanciamientosListPage.tsx
// Lista de refinanciamientos activos

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../Servicios/api";


type Refinanciamiento = {
  id: number;
  documentoId: number;
  documentoNumero: string;
  empresaId: number;
  empresaNombre: string;
  montoRefinanciado: number;
  montoPagado: number;
  montoPendiente: number;
  fechaRefinanciamiento: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estado: number;
  estadoNombre: string;
};

export default function RefinanciamientosListPage() {
  const navigate = useNavigate();
  const [refinanciamientos, setRefinanciamientos] = useState<Refinanciamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("activos");

  useEffect(() => {
    loadRefinanciamientos();
  }, [filtroEstado]);

  const loadRefinanciamientos = async () => {
    try {
      setLoading(true);
      let url = "/refinanciamiento";
      if (filtroEstado === "activos") url += "?estado=0";
      else if (filtroEstado === "vencidos") url += "?estado=2";
      else if (filtroEstado === "pagados") url += "?estado=1";
      
      const res = await api.get(url);
      const data = res.data;

      // Manejar diferentes formatos de respuesta del API
      let lista: Refinanciamiento[] = [];
      
      if (Array.isArray(data)) {
        lista = data;
      } else if (data.data && Array.isArray(data.data)) {
        lista = data.data;
      } else if (data.refinanciamientos && Array.isArray(data.refinanciamientos)) {
        lista = data.refinanciamientos;
      } else {
        console.warn("Formato de refinanciamientos no reconocido:", data);
        lista = [];
      }

      // Asegurar que todos los campos numéricos tengan valores por defecto
      const listaSegura = lista.map(r => ({
        ...r,
        montoRefinanciado: r.montoRefinanciado ?? 0,
        montoPagado: r.montoPagado ?? 0,
        montoPendiente: r.montoPendiente ?? 0,
        diasRestantes: r.diasRestantes ?? 0,
        estado: r.estado ?? 0,
        empresaNombre: r.empresaNombre ?? "Sin nombre",
        documentoNumero: r.documentoNumero ?? "—",
        estadoNombre: r.estadoNombre ?? "Desconocido"
      }));

      setRefinanciamientos(listaSegura);
    } catch (error) {
      console.error("Error cargando refinanciamientos:", error);
      setRefinanciamientos([]);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de formateo con validación
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return "RD$0.00";
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("es-DO");
    } catch {
      return "—";
    }
  };

  const getEstadoStyle = (estado: number, diasRestantes: number) => {
    if (estado === 1) return "bg-green-100 text-green-700"; // Pagado
    if (estado === 2) return "bg-red-100 text-red-700"; // Vencido
    if (diasRestantes <= 7) return "bg-amber-100 text-amber-700"; // Próximo a vencer
    return "bg-sky-100 text-sky-700"; // Activo
  };

  // Calcular totales con validación
  const totales = {
    activos: refinanciamientos.filter(r => r.estado === 0).length,
    vencidos: refinanciamientos.filter(r => r.estado === 2).length,
    montoPendiente: refinanciamientos.reduce((sum, r) => sum + (r.montoPendiente || 0), 0)
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando refinanciamientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">
              💰 Pagos
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Refinanciamientos</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">🔄 Refinanciamientos</h1>
          <p className="text-gray-500 mt-1">Deudas refinanciadas de empresas</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-medium text-purple-800">¿Qué es un refinanciamiento?</p>
            <p className="text-sm text-purple-700 mt-1">
              Cuando una empresa no puede pagar su deuda, puedes refinanciarla. 
              Esto restablece el crédito de sus empleados y da 30 días adicionales para pagar.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-xl font-bold text-gray-900">{totales.activos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vencidos</p>
              <p className="text-xl font-bold text-red-600">{totales.vencidos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto Pendiente</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totales.montoPendiente)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroEstado("activos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "activos"
                ? "bg-sky-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltroEstado("vencidos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "vencidos"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Vencidos
          </button>
          <button
            onClick={() => setFiltroEstado("pagados")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "pagados"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pagados
          </button>
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroEstado === "todos"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {refinanciamientos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin refinanciamientos</h3>
            <p className="text-gray-500">No hay refinanciamientos en este estado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Empresa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Documento</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Monto</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Pendiente</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Vencimiento</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refinanciamientos.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-semibold">
                          {(ref.empresaNombre || "?").charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{ref.empresaNombre || "Sin nombre"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{ref.documentoNumero || "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(ref.montoRefinanciado)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(ref.montoPendiente)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <span className="block text-gray-900">{formatDate(ref.fechaVencimiento)}</span>
                        <span className={`text-xs ${(ref.diasRestantes || 0) < 0 ? "text-red-600" : (ref.diasRestantes || 0) <= 7 ? "text-amber-600" : "text-gray-500"}`}>
                          {(ref.diasRestantes || 0) < 0 
                            ? `Vencido hace ${Math.abs(ref.diasRestantes || 0)} días` 
                            : (ref.diasRestantes || 0) === 0 
                              ? "Vence hoy"
                              : `${ref.diasRestantes || 0} días restantes`
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoStyle(ref.estado || 0, ref.diasRestantes || 0)}`}>
                        {ref.estadoNombre || "Desconocido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/pagos/refinanciamientos/${ref.id}`)}
                          className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                        >
                          Ver
                        </button>
                        {ref.estado !== 1 && (
                          <button
                            onClick={() => navigate(`/pagos/refinanciamientos/${ref.id}/pagar`)}
                            className="px-3 py-1.5 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
                          >
                            Pagar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}