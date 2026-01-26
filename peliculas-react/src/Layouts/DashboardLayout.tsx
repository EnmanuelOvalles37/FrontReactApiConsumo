// src/layouts/DashboardLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import Header from "../Componentes/Dashboard/Header";
import Sidebar from "../Componentes/Dashboard/Sidebar";
import { useAuth } from "../Context/AuthContext";
import { useState } from "react";

export default function DashboardLayout() {
  const { currentUser, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hasPermission={hasPermission}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={currentUser}
          onLogout={() => {/* ya lo manejas en Header */}}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
