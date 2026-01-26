// src/Paginas/Pagos/Reportes/ReportesPage.tsx
// Dashboard de reportes con navegación a reportes específicos

import { Link } from "react-router-dom";

type ReportCard = {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
};

const reportes: ReportCard[] = [
  {
    title: "Historial de Cobros CxC",
    description: "Pagos recibidos de empresas por concepto de cuentas por cobrar",
    icon: "💵",
    path: "/pagos/reportes/cobros-cxc",
    color: "bg-green-500"
  },
  {
    title: "Historial de Pagos CxP",
    description: "Pagos realizados a proveedores por concepto de cuentas por pagar",
    icon: "💳",
    path: "/pagos/reportes/pagos-cxp",
    color: "bg-amber-500"
  },
  {
    title: "Reporte de Refinanciamientos",
    description: "Estado y seguimiento de deudas refinanciadas",
    icon: "🔄",
    path: "/pagos/reportes/refinanciamientos",
    color: "bg-purple-500"
  },
  {
    title: "Antigüedad CxC",
    description: "Análisis de vencimiento de cuentas por cobrar",
    icon: "📊",
    path: "/pagos/reportes/antiguedad-cxc",
    color: "bg-sky-500"
  },
  {
    title: "Antigüedad CxP",
    description: "Análisis de vencimiento de cuentas por pagar",
    icon: "📈",
    path: "/pagos/reportes/antiguedad-cxp",
    color: "bg-rose-500"
  }
];

export default function ReportesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">
            💰 Pagos
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Reportes</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Reportes y Análisis</h1>
        <p className="text-gray-500 mt-1">
          Genera reportes detallados de cobros, pagos y refinanciamientos
        </p>
      </div>

      {/* Info */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-medium text-sky-800">Exportación disponible</p>
            <p className="text-sm text-sky-700 mt-1">
              Todos los reportes pueden exportarse a PDF para impresión o CSV para análisis en Excel.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportes.map((reporte) => (
          <Link
            key={reporte.path}
            to={reporte.path}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${reporte.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                {reporte.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                  {reporte.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {reporte.description}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-400">Ver reporte</span>
              <span className="text-sky-500 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">⚡ Accesos rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/pagos/cxc"
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🏢</span>
            <span className="text-sm text-gray-700">Empresas CxC</span>
          </Link>
          <Link
            to="/pagos/cxp"
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🏪</span>
            <span className="text-sm text-gray-700">Proveedores CxP</span>
          </Link>
          <Link
            to="/pagos/refinanciamientos"
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🔄</span>
            <span className="text-sm text-gray-700">Refinanciamientos</span>
          </Link>
          <Link
            to="/pagos"
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📋</span>
            <span className="text-sm text-gray-700">Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}