 // src/Paginas/Dashboard/ModuleGrid.tsx
// Grid de módulos - Diseño mejorado
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

type ModuleItem = {
  key: string;
  label: string;
  description: string;
  icon: string;
  path: string;
  permission?: string;
  color: string;
  category: "operaciones" | "finanzas" | "reportes" | "administracion";
};

const ALL_MODULES: ModuleItem[] = [
  // ==================== OPERACIONES ====================
  { 
    key: "consumos", 
    label: "Consumos", 
    description: "Registrar y gestionar consumos", 
    icon: "🛒", 
    path: "/modulo-consumos",
    permission: "consumos_ver",
    color: "emerald",
    category: "operaciones"
  },
  /*{ 
    key: "clientes", 
    label: "Clientes", 
    description: "Gestión de empleados/clientes", 
    icon: "👥", 
    path: "/clientes", 
    permission: "clientes_ver",
    color: "sky",
    category: "operaciones"
  },*/
  { 
    key: "empresas", 
    label: "Empresas", 
    description: "Gestión de empresas", 
    icon: "🏢", 
    path: "/empresas", 
    permission: "empresas_ver",
    color: "blue",
    category: "operaciones"
  },
  { 
    key: "proveedores", 
    label: "Proveedores", 
    description: "Gestión de proveedores", 
    icon: "🏪", 
    path: "/proveedores", 
    permission: "proveedores_ver",
    color: "teal",
    category: "operaciones"
  },
  
  // ==================== FINANZAS ====================
  { 
    key: "pagos", 
    label: "Pagos", 
    description: "Dashboard de pagos CxC/CxP", 
    icon: "💵", 
    path: "/pagos", 
    permission: "registro_ver",
    color: "amber",
    category: "finanzas"
  },
  { 
    key: "cxc", 
    label: "Cuentas por Cobrar", 
    description: "Cobros a empresas", 
    icon: "💰", 
    path: "/pagos/cxc", 
    permission: "cuentas_por_cobrar",
    color: "green",
    category: "finanzas"
  },
  { 
    key: "cxp", 
    label: "Cuentas por Pagar", 
    description: "Pagos a proveedores", 
    icon: "💳", 
    path: "/pagos/cxp", 
    permission: "cuentas_por_pagar",
    color: "orange",
    category: "finanzas"
  },
  { 
    key: "refinanciamientos", 
    label: "Refinanciamientos", 
    description: "Deudas refinanciadas", 
    icon: "🔄", 
    path: "/pagos/refinanciamientos", 
    permission: "refinanciamientos_ver",
    color: "violet",
    category: "finanzas"
  },
  
  // ==================== REPORTES ====================
  { 
    key: "reportes", 
    label: "Reportes", 
    description: "Todos los reportes del sistema", 
    icon: "📊", 
    path: "/reportes",
    color: "indigo",
    category: "reportes"
  },
  { 
    key: "reporte-consumos", 
    label: "Reporte Consumos", 
    description: "Consumos por periodo", 
    icon: "🛒", 
    path: "/reportes/consumos",
    color: "emerald",
    category: "reportes"
  },
  { 
    key: "reporte-cobros", 
    label: "Cobros CxC", 
    description: "Historial de cobros", 
    icon: "💰", 
    path: "/reportes/cobros-cxc",
    color: "green",
    category: "reportes"
  },
  { 
    key: "reporte-pagos", 
    label: "Pagos CxP", 
    description: "Historial de pagos", 
    icon: "💸", 
    path: "/reportes/pagos-cxp",
    color: "orange",
    category: "reportes"
  },
  { 
    key: "antiguedad-cxc", 
    label: "Antigüedad CxC", 
    description: "Vencimientos por cobrar", 
    icon: "📅", 
    path: "/reportes/antiguedad-cxc",
    color: "red",
    category: "reportes"
  },
  { 
    key: "antiguedad-cxp", 
    label: "Antigüedad CxP", 
    description: "Vencimientos por pagar", 
    icon: "📆", 
    path: "/reportes/antiguedad-cxp",
    color: "rose",
    category: "reportes"
  },
  
  // ==================== ADMINISTRACION ====================
  { 
    key: "usuarios", 
    label: "Usuarios", 
    description: "Gestión de usuarios", 
    icon: "👤", 
    path: "/seguridad/usuarios", 
    permission: "admin_usuarios",
    color: "slate",
    category: "administracion"
  },
  { 
    key: "roles", 
    label: "Roles y Permisos", 
    description: "Configurar accesos", 
    icon: "🛡️", 
    path: "/seguridad/roles", 
    permission: "admin_roles",
    color: "purple",
    category: "administracion"
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-300" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200", hover: "hover:border-sky-300" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", hover: "hover:border-violet-300" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", hover: "hover:border-rose-300" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", hover: "hover:border-amber-300" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", hover: "hover:border-indigo-300" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", hover: "hover:border-cyan-300" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", hover: "hover:border-orange-300" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", hover: "hover:border-blue-300" },
  teal: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200", hover: "hover:border-teal-300" },
  slate: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", hover: "hover:border-slate-300" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", hover: "hover:border-purple-300" },
  green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", hover: "hover:border-green-300" },
  red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", hover: "hover:border-red-300" },
};

const categoryLabels: Record<string, { label: string; icon: string }> = {
  operaciones: { label: "Operaciones", icon: "⚡" },
  finanzas: { label: "Finanzas", icon: "💰" },
  reportes: { label: "Reportes", icon: "📊" },
  administracion: { label: "Administración", icon: "⚙️" },
};

function ModuleCard({ item }: { item: ModuleItem }) {
  const colors = colorClasses[item.color] || colorClasses.sky;
  
  return (
    <Link
      to={item.path}
      className={`group bg-white rounded-2xl border-2 ${colors.border} ${colors.hover} p-4 transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <span className="text-xl">{item.icon}</span>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors truncate">
            {item.label}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Flecha */}
        <span className="text-gray-300 group-hover:text-sky-500 transition-colors shrink-0">
          →
        </span>
      </div>
    </Link>
  );
}

export default function ModuleGrid() {
  const { hasPermission } = useAuth();

  // Filtrar módulos según permisos
  const modules = useMemo(() => {
    return ALL_MODULES.filter(m => !m.permission || hasPermission(m.permission));
  }, [hasPermission]);

  // Agrupar por categoría
  const groupedModules = useMemo(() => {
    const groups: Record<string, ModuleItem[]> = {};
    modules.forEach(m => {
      if (!groups[m.category]) {
        groups[m.category] = [];
      }
      groups[m.category].push(m);
    });
    return groups;
  }, [modules]);

  const categoryOrder = ["operaciones", "finanzas", "reportes", "administracion"];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Módulos del Sistema</h2>
        <span className="text-sm text-gray-500">{modules.length} módulos disponibles</span>
      </div>

      {categoryOrder.map(category => {
        const categoryModules = groupedModules[category];
        if (!categoryModules || categoryModules.length === 0) return null;
        
        const categoryInfo = categoryLabels[category];
        
        return (
          <div key={category}>
            {/* Header de categoría */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{categoryInfo.icon}</span>
              <h3 className="text-sm font-medium text-gray-700">{categoryInfo.label}</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">{categoryModules.length}</span>
            </div>
            
            {/* Grid de módulos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categoryModules.map(m => (
                <ModuleCard key={m.key} item={m} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}