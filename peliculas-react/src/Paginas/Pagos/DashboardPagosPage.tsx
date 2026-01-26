// src/Paginas/Pagos/PagosDashboardPage.tsx
// Dashboard principal del módulo de pagos - CxC, CxP y Refinanciamientos

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";


type DashboardData = {
  cxc: {
    totalDocumentos: number;
    totalPorCobrar: number;
    totalVencido: number;
    totalRefinanciado: number;
    cobradoMes: number;
  };
  cxp: {
    totalDocumentos: number;
    totalBruto: number;
    totalComision: number;
    totalPorPagar: number;
    totalVencido: number;
    comisionesMes: number;
  };
  refinanciamientos: {
    totalActivos: number;
    totalVencidos: number;
    montoPendiente: number;
    proximosVencer: number;
  };
};

export default function PagosDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cxcRes, cxpRes, refRes] = await Promise.all([
        api.get("/cxc/dashboard"),
        api.get("/cxp/dashboard"),
        api.get("/refinanciamiento/dashboard")
      ]);

      setData({
        cxc: {
          totalDocumentos: cxcRes.data.resumen?.totalDocumentos || 0,
          totalPorCobrar: cxcRes.data.resumen?.totalPorCobrar || 0,
          totalVencido: cxcRes.data.resumen?.totalVencido || 0,
          totalRefinanciado: cxcRes.data.resumen?.totalRefinanciado || 0,
          cobradoMes: cxcRes.data.cobradoMes || 0
        },
        cxp: {
          totalDocumentos: cxpRes.data.resumen?.totalDocumentos || 0,
          totalBruto: cxpRes.data.resumen?.totalBruto || 0,
          totalComision: cxpRes.data.resumen?.totalComision || 0,
          totalPorPagar: cxpRes.data.resumen?.totalPorPagar || 0,
          totalVencido: cxpRes.data.resumen?.totalVencido || 0,
          comisionesMes: cxpRes.data.comisionesMes || 0
        },
        /*refinanciamientos: {
          totalActivos: refRes.data.totalActivos || 0,
          totalVencidos: refRes.data.totalVencidos || 0,
          montoPendiente: refRes.data.montoPendiente || 0,
          proximosVencer: refRes.data.proximosVencer || 0
        }*/
       refinanciamientos: {
  totalActivos: refRes.data.resumen?.totalActivos || 0,
  totalVencidos: refRes.data.resumen?.totalVencidos || 0,
  montoPendiente: refRes.data.resumen?.montoPendiente || 0,
  proximosVencer: refRes.data.resumen?.proximosVencer || 0
}

      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Módulo de Pagos</h1>
          <p className="text-gray-500 mt-1">Gestión de cuentas por cobrar, pagar y refinanciamientos</p>
        </div>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CxC */}
        <Link
          to="/pagos/cxc"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-sky-200 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl">
              💵
            </div>
            <span className="text-sky-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Cuentas por Cobrar</h2>
          <p className="text-sm text-gray-500 mb-4">Cobros a empresas</p>
          
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Por Cobrar</span>
              <span className="font-semibold text-gray-900">{formatCurrency(data?.cxc.totalPorCobrar || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Vencido</span>
              <span className="font-semibold text-red-600">{formatCurrency(data?.cxc.totalVencido || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Cobrado este mes</span>
              <span className="font-semibold text-green-600">{formatCurrency(data?.cxc.cobradoMes || 0)}</span>
            </div>
          </div>
        </Link>

        {/* CxP */}
        <Link
          to="/pagos/cxp"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-sky-200 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
              💳
            </div>
            <span className="text-sky-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Cuentas por Pagar</h2>
          <p className="text-sm text-gray-500 mb-4">Pagos a proveedores</p>
          
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Por Pagar</span>
              <span className="font-semibold text-gray-900">{formatCurrency(data?.cxp.totalPorPagar || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Tu Comisión</span>
              <span className="font-semibold text-green-600">{formatCurrency(data?.cxp.totalComision || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Comisiones del mes</span>
              <span className="font-semibold text-green-600">{formatCurrency(data?.cxp.comisionesMes || 0)}</span>
            </div>
          </div>
        </Link>

        {/* Refinanciamientos */}
        <Link
          to="/pagos/refinanciamientos"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-sky-200 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              🔄
            </div>
            <span className="text-sky-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Refinanciamientos</h2>
          <p className="text-sm text-gray-500 mb-4">Deudas refinanciadas</p>
          
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Activos</span>
              <span className="font-semibold text-gray-900">{data?.refinanciamientos.totalActivos || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Vencidos</span>
              <span className="font-semibold text-red-600">{data?.refinanciamientos.totalVencidos || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Próximos a vencer</span>
              <span className={`font-semibold ${(data?.refinanciamientos.proximosVencer || 0) > 0 ? "text-amber-600" : "text-gray-600"}`}>
                {data?.refinanciamientos.proximosVencer || 0}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Banner de comisión */}
      {(data?.cxp.comisionesMes || 0) > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Comisiones ganadas este mes</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(data?.cxp.comisionesMes || 0)}</p>
            </div>
            <div className="text-5xl opacity-50">💰</div>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">⚡ Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/pagos/cxc/generar"
            className="p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">📄</span>
            <span className="text-sm font-medium text-sky-700">Generar Consolidado CxC</span>
          </Link>
          <Link
            to="/pagos/cxp/generar"
            className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">📋</span>
            <span className="text-sm font-medium text-amber-700">Generar Consolidado CxP</span>
          </Link>
          <Link
            to="/pagos/cxc"
            className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">💵</span>
            <span className="text-sm font-medium text-green-700">Registrar Cobro</span>
          </Link>
          <Link
            to="/pagos/cxp"
            className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">💳</span>
            <span className="text-sm font-medium text-purple-700">Registrar Pago</span>
          </Link>
        </div>
      </div>

      {/* Reportes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Reportes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/pagos/reportes/antiguedad-cxc"
            className="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-all text-center"
          >
            <span className="text-2xl mb-2 block">📅</span>
            <span className="text-sm font-medium text-gray-700">Antigüedad CxC</span>
          </Link>
          <Link
            to="/pagos/reportes/antiguedad-cxp"
            className="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-all text-center"
          >
            <span className="text-2xl mb-2 block">📆</span>
            <span className="text-sm font-medium text-gray-700">Antigüedad CxP</span>
          </Link>
          <Link
            to="/pagos/reportes/comisiones"
            className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all text-center"
          >
            <span className="text-2xl mb-2 block">💰</span>
            <span className="text-sm font-medium text-gray-700">Comisiones Ganadas</span>
          </Link>
          <Link
            to="/pagos/reportes/historial"
            className="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-all text-center"
          >
            <span className="text-2xl mb-2 block">📜</span>
            <span className="text-sm font-medium text-gray-700">Historial de Pagos</span>
          </Link>
        </div>
      </div>

      {/* Alertas */}
      {((data?.cxc.totalVencido || 0) > 0 || (data?.refinanciamientos.totalVencidos || 0) > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span>⚠️</span> Alertas
          </h3>
          <div className="space-y-2">
            {(data?.cxc.totalVencido || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <span className="text-red-700">Tienes {formatCurrency(data?.cxc.totalVencido || 0)} en CxC vencidas</span>
                <Link to="/pagos/cxc" className="text-sm text-red-600 hover:underline font-medium">
                  Ver →
                </Link>
              </div>
            )}
            {(data?.refinanciamientos.totalVencidos || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <span className="text-red-700">Tienes {data?.refinanciamientos.totalVencidos} refinanciamientos vencidos</span>
                <Link to="/pagos/refinanciamientos" className="text-sm text-red-600 hover:underline font-medium">
                  Ver →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}