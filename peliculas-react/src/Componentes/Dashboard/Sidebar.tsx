// src/Componentes/Sidebar.tsx
// Sidebar - Diseño mejorado
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, currentUser, logout } = useAuth();

  const menuSections = [
    {
      title: "Principal",
      items: [
        { title: "Dashboard", path: "/dashboard", icon: "📊", permission: "panel_ver" },
      ]
    },
    {
      title: "Operaciones",
      items: [
        //{ title: "Registrar Consumo", path: "/consumos/nuevo", icon: "💳", permission: "registrar_consumo" },
        { title: "Módulo Consumos", path: "/modulo-consumos", icon: "🛒", permission: "reporte_consumos" },
        //{ title: "Consumos del Sistema", path: "/admin/consumos", icon: "📋", permission: "panel_ver" },
      ]
    },
    {
      title: "Finanzas",
      items: [
        //{ title: "Cuentas por Cobrar", path: "/cuentas/cobrar", icon: "💰", permission: "cuentas_por_cobrar" },
        //{ title: "Cuentas por Pagar", path: "/cuentas/pagar", icon: "💳", permission: "cuentas_por_pagar" },
        { title: "Pagos", path: "/pagos", icon: "💵", permission: "admin_usuarios" },
        //{ title: "Vencimientos CxP", path: "/cxp/vencimientos", icon: "📅", permission: "reporte_vencimientos_cxp" },
      ]
    },
    {
      title: "Catálogos",
      items: [
        { title: "Empresas", path: "/empresas", icon: "🏢", permission: "empresas_ver" },
        { title: "Proveedores", path: "/proveedores", icon: "🏪", permission: "proveedores_ver" },
      ]
    },
    {
      title: "Reportes",
      items: [
        { title: "Reportes", path: "/reportes/nuevo", icon: "📈", permission: "reportes_generales" },
      ]
    },
    {
      title: "Seguridad",
      items: [
        { title: "Usuarios", path: "/seguridad/usuarios", icon: "👤", permission: "admin_usuarios" },
        { title: "Roles y Permisos", path: "/seguridad/roles", icon: "🛡️", permission: "admin_roles" },
      ]
    },
  ];

  const handleLogout = () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">💼</span>
            </div>
            <span className="font-bold text-gray-900">Sistema</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
          >
            <span className="text-gray-500">✕</span>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuSections.map((section, sectionIndex) => {
            // Filtrar items según permisos
            const visibleItems = section.items.filter(item => hasPermission(item.permission));
            
            if (visibleItems.length === 0) return null;

            return (
              <div key={sectionIndex} className="mb-6">
                {/* Título de sección */}
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
                
                {/* Items */}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path || 
                                   location.pathname.startsWith(item.path + "/");

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          isActive
                            ? "bg-sky-50 text-sky-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <span className="text-lg w-6 text-center">{item.icon}</span>
                        <span className="text-sm">{item.title}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer del sidebar - Usuario y logout */}
        <div className="border-t border-gray-200 p-4">
          {/* Info del usuario */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-semibold">
              {currentUser?.usuario?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.usuario}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.rol}
              </p>
            </div>
          </div>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <span>🚪</span>
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;