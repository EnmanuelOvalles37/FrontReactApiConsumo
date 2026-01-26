import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Sidebar from "../Componentes/Dashboard/Sidebar";
import Header from "../Componentes/Dashboard/Header";

export default function AppShell() {
  const { currentUser, logout, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar oscuro / tu componente existente */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hasPermission={hasPermission}
      />

      {/* Contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={currentUser}
          onLogout={logout}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Aquí se inyectan las pantallas (Dashboard, Hubs, etc.) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
