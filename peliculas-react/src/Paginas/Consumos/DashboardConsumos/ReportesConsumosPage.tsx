// src/Paginas/Consumos/ReportesConsumosPage.tsx
// Página índice de reportes de consumos

import { Link } from "react-router-dom";

export default function ReportesConsumosPage() {
  const reportes = [
    {
      titulo: "Reporte Diario",
      descripcion: "Resumen detallado de consumos de un día específico",
      icono: "📅",
      ruta: "/modulo-consumos/reportes/diario",
      color: "sky",
    },
    {
      titulo: "Reporte por Período",
      descripcion: "Análisis de consumos en un rango de fechas",
      icono: "📊",
      ruta: "/modulo-consumos/reportes/periodo",
      color: "green",
    },
    {
      titulo: "Por Empresa",
      descripcion: "Consumos agrupados por cada empresa cliente",
      icono: "🏢",
      ruta: "/modulo-consumos/por-empresa",
      color: "purple",
    },
    {
      titulo: "Por Cliente",
      descripcion: "Historial y resumen de consumos por cliente",
      icono: "👤",
      ruta: "/modulo-consumos/por-cliente",
      color: "yellow",
    },
    {
      titulo: "Por Proveedor",
      descripcion: "Consumos agrupados por proveedor/tienda",
      icono: "🏪",
      ruta: "/modulo-consumos/por-proveedor",
      color: "orange",
    },
    {
      titulo: "Reversos",
      descripcion: "Historial de consumos reversados",
      icono: "↩️",
      ruta: "/modulo-consumos/reversos",
      color: "red",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; icon: string }> = {
      sky: { bg: "bg-sky-50", hover: "hover:bg-sky-100", icon: "bg-sky-100" },
      green: { bg: "bg-green-50", hover: "hover:bg-green-100", icon: "bg-green-100" },
      purple: { bg: "bg-purple-50", hover: "hover:bg-purple-100", icon: "bg-purple-100" },
      yellow: { bg: "bg-yellow-50", hover: "hover:bg-yellow-100", icon: "bg-yellow-100" },
      orange: { bg: "bg-orange-50", hover: "hover:bg-orange-100", icon: "bg-orange-100" },
      red: { bg: "bg-red-50", hover: "hover:bg-red-100", icon: "bg-red-100" },
    };
    return colors[color] || colors.sky;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/modulo-consumos" className="hover:text-gray-700">Consumos</Link>
          <span>→</span>
          <span className="text-gray-900">Reportes</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Reportes de Consumos</h1>
        <p className="text-sm text-gray-500 mt-1">Análisis y reportes del módulo de consumos</p>
      </div>

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportes.map((reporte) => {
          const colors = getColorClasses(reporte.color);
          return (
            <Link
              key={reporte.ruta}
              to={reporte.ruta}
              className={`${colors.bg} ${colors.hover} rounded-2xl p-6 transition-all hover:shadow-md group`}
            >
              <div className="flex items-start gap-4">
                <div className={`${colors.icon} w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {reporte.icono}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-sky-700 transition-colors">
                    {reporte.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {reporte.descripcion}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-3">
         
          <Link
            to="/modulo-consumos/lista"
            className="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
          >
            📋 Ver Todos los Consumos
          </Link>
          <Link
            to="/modulo-consumos"
            className="px-4 py-2 rounded-xl border hover:bg-gray-50 transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}