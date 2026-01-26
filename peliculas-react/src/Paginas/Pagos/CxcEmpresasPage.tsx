/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/CxC/CxcEmpresasPage.tsx
// Lista de empresas con saldo pendiente de cobro

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Servicios/api";


type EmpresaCxc = {
  empresaId: number;
  empresaNombre: string;
  diaCorte: number | null;
  documentosPendientes: number;
  totalPorCobrar: number;
  totalRefinanciado: number;
  vencido: number;
};

export default function CxcEmpresasPage() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<EmpresaCxc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
  try {
    setLoading(true);
    const res = await api.get("/cxc/empresas");

    // Usar camelCase (como lo devuelve ASP.NET Core)
    const data: EmpresaCxc[] = res.data.map((e: any) => ({
      empresaId: e.empresaId,
      empresaNombre: e.empresaNombre ?? "Sin nombre",
      diaCorte: e.diaCorte,
      documentosPendientes: e.documentosPendientes ?? 0,
      totalPorCobrar: e.totalPorCobrar ?? 0,
      totalRefinanciado: e.totalRefinanciado ?? 0,
      vencido: e.vencido ?? 0
    }));

    setEmpresas(data);
  } catch (error) {
    console.error("Error cargando empresas:", error);
  } finally {
    setLoading(false);
  }
};

  /*const loadEmpresas = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cxc/empresas");
      setEmpresas(res.data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  }; */

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  /*const empresasFiltradas = empresas.filter(e =>
    e.empresaNombre.toLowerCase().includes(busqueda.toLowerCase())
  );*/
  const empresasFiltradas = empresas.filter(e =>
  (e.empresaNombre ?? "")
    .toLowerCase()
    .includes(busqueda.toLowerCase())
);

  const totales = {
    porCobrar: empresas.reduce((sum, e) => sum + e.totalPorCobrar, 0),
    vencido: empresas.reduce((sum, e) => sum + e.vencido, 0),
    refinanciado: empresas.reduce((sum, e) => sum + e.totalRefinanciado, 0)
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando empresas...</p>
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
            <span className="text-gray-900 font-medium">Cuentas por Cobrar</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">💵 Cuentas por Cobrar</h1>
          <p className="text-gray-500 mt-1">Empresas con saldo pendiente</p>
        </div>
        <Link
          to="/pagos/cxc/generar"
          className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
        >
          + Generar Consolidado
        </Link>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💵</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total por Cobrar</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totales.porCobrar)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vencido</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totales.vencido)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Refinanciado</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totales.refinanciado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar empresa..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {/* Lista de empresas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {empresasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin cuentas pendientes</h3>
            <p className="text-gray-500">No hay empresas con saldo por cobrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Empresa</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Día Corte</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Docs</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Por Cobrar</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Refinanciado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Vencido</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empresasFiltradas.map((emp) => (
                  <tr key={emp.empresaId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-semibold">
                          {/*{emp.empresaNombre.charAt(0)}*/}
                          {(emp.empresaNombre ?? "?").charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{emp.empresaNombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {emp.diaCorte ? (
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm font-medium">
                          Día {emp.diaCorte}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                        {emp.documentosPendientes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(emp.totalPorCobrar)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {emp.totalRefinanciado > 0 ? (
                        <span className="text-purple-600 font-medium">{formatCurrency(emp.totalRefinanciado)}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {emp.vencido > 0 ? (
                        <span className="text-red-600 font-semibold">{formatCurrency(emp.vencido)}</span>
                      ) : (
                        <span className="text-green-600">Al día</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/pagos/cxc/empresas/${emp.empresaId}`)}
                          className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                        >
                          Ver
                        </button>
                        {/*<button
                          onClick={() => navigate(`/pagos/cxc/empresas/${emp.empresaId}/cobrar`)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                        >
                          Cobrar
                        </button>*/}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones adicionales */}
      <div className="flex gap-4">
        <Link
          to="/pagos/cxc/historial"
          className="flex-1 p-4 bg-white rounded-xl border border-gray-200 hover:border-sky-300 transition-colors text-center"
        >
          <span className="text-2xl mb-2 block">📜</span>
          <span className="text-sm font-medium text-gray-700">Historial de Cobros</span>
        </Link>
        <Link
          to="/pagos/reportes/antiguedad-cxc"
          className="flex-1 p-4 bg-white rounded-xl border border-gray-200 hover:border-sky-300 transition-colors text-center"
        >
          <span className="text-2xl mb-2 block">📊</span>
          <span className="text-sm font-medium text-gray-700">Reporte Antigüedad</span>
        </Link>
      </div>
    </div>
  );
}