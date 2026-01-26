// src/Paginas/Reportes/ReportesPage.tsx
import { useNavigate } from "react-router-dom";

const reportes = [
  {
    id: "consumos",
    titulo: "Consumos por Período",
    descripcion: "Detalle de consumos realizados por empleados",
    icono: "🛒",
    color: "bg-blue-500",
    ruta: "/reportes/consumos"
  },
  {
    id: "cobros-cxc",
    titulo: "Cobros CxC",
    descripcion: "Pagos recibidos de las empresas",
    icono: "💰",
    color: "bg-green-500",
    ruta: "/reportes/cobros-cxc"
  },
  {
    id: "pagos-cxp",
    titulo: "Pagos CxP",
    descripcion: "Pagos realizados a proveedores",
    icono: "💸",
    color: "bg-orange-500",
    ruta: "/reportes/pagos-cxp"
  },
  {
    id: "antiguedad-cxc",
    titulo: "Antigüedad CxC",
    descripcion: "Análisis de vencimiento de cuentas por cobrar",
    icono: "📅",
    color: "bg-red-500",
    ruta: "/reportes/antiguedad-cxc"
  },
  {
    id: "antiguedad-cxp",
    titulo: "Antigüedad CxP",
    descripcion: "Análisis de vencimiento de cuentas por pagar",
    icono: "📆",
    color: "bg-purple-500",
    ruta: "/reportes/antiguedad-cxp"
  },
  {
    id: "refinanciamientos",
    titulo: "Refinanciamientos",
    descripcion: "Estado de deudas refinanciadas",
    icono: "🔄",
    color: "bg-sky-500",
    ruta: "/reportes/refinanciamientos"
  }
];

export default function ReportesPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">📊 Reportes</h1>
        <p className="text-gray-500 mt-1">Selecciona un reporte para generar</p>
      </div>

      {/* Grid de reportes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportes.map((reporte) => (
          <button
            key={reporte.id}
            onClick={() => navigate(reporte.ruta)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div className={`w-14 h-14 ${reporte.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {reporte.icono}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {reporte.titulo}
            </h3>
            <p className="text-sm text-gray-500">
              {reporte.descripcion}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
