// src/views/admin/AdminLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import Tabs from "../Componentes/Tabs";
import { useAuth } from "../Context/AuthContext";

export default function AdminLayout() {
  const { hasPermission } = useAuth();
  // si no tiene ninguno de admin, redirige
  if (!hasPermission("admin_usuarios") && !hasPermission("admin_roles")) {
    return <Navigate to="/dashboard" replace />;
  }

  const tabs = [
    { to: "usuarios", label: "Usuarios", permiso: "admin_usuarios" },
    { to: "roles", label: "Roles", permiso: "admin_roles" },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Administración</h2>
      <Tabs basePath="/admin" tabs={tabs} />
      <Outlet />
    </div>
  );
}
