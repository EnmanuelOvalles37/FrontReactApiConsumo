/*import { Link } from "react-router-dom";

interface QuickActionsProps {
  hasPermission: (permiso: string) => boolean;
}

const QuickActions = ({ hasPermission }: QuickActionsProps) => {
  const actions = [
    {
      title: "Nuevo Cliente",
      description: "Agregar nuevo cliente al sistema",
      icon: "➕",
      path: "/clientes/nuevo",
      permission: "guardar_clientes",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Registrar Consumo",
      description: "Registrar nuevo consumo",
      icon: "📝",
      path: "/consumos/nuevo",
      permission: "registrar_consumo",
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Generar Reporte",
      description: "Generar reporte de consumos",
      icon: "📈",
      path: "/reportes",
      permission: "reportes_generales",
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Ver Proveedores",
      description: "Gestionar proveedores",
      icon: "🏢",
      path: "/proveedores/listado",
      permission: "proveedores_usuarios",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Acciones Rápidas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          if (!hasPermission(action.permission)) return null;
          
          return (
            <Link
              key={index}
              to={action.path}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow block"
            >
              <div className={`p-2 rounded-lg ${action.color} w-12 h-12 flex items-center justify-center text-xl mb-3`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions; */

// src/Paginas/Dashboard/QuickActions.tsx
// Acciones rápidas - Diseño mejorado
import { Link } from "react-router-dom";

interface QuickActionsProps {
  hasPermission: (permiso: string) => boolean;
}

const QuickActions = ({ hasPermission }: QuickActionsProps) => {
  const actions = [
    {
      title: "Empresas",
      description: "Gestionar Empresas",
      icon: "🏢",
      path: "/empresas",
      permission: "guardar_clientes",
      gradient: "from-sky-500 to-sky-600",
      hoverBg: "hover:bg-sky-50"
    },/*
    {
      title: "Registrar Consumo",
      description: "Registrar nuevo consumo",
      icon: "💳",
      path: "/consumos/nuevo",
      permission: "registrar_consumo",
      gradient: "from-emerald-500 to-emerald-600",
      hoverBg: "hover:bg-emerald-50"
    },*/
    {
      title: "Proveedores",
      description: "Gestionar proveedores",
      icon: "🏪",
      path: "/proveedores",
      permission: "proveedores_ver",
      gradient: "from-amber-500 to-amber-600",
      hoverBg: "hover:bg-amber-50"
    },
    {
      title: "Generar Reporte",
      description: "Reportes del sistema",
      icon: "📈",
      path: "/reportes",
      permission: "reportes_generales",
      gradient: "from-violet-500 to-violet-600",
      hoverBg: "hover:bg-violet-50"
    }    
  ];

  // Filtrar acciones según permisos
  const visibleActions = actions.filter(action => hasPermission(action.permission));

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
        <span className="text-sm text-gray-500">{visibleActions.length} disponibles</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={`group bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${action.hoverBg}`}
          >
            {/* Icono con gradiente */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <span className="text-2xl">{action.icon}</span>
            </div>
            
            {/* Texto */}
            <h3 className="font-semibold text-gray-900 mb-0.5 group-hover:text-sky-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-xs text-gray-500">
              {action.description}
            </p>

            {/* Flecha */}
            <div className="mt-3 flex items-center text-sky-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Ir <span className="ml-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;