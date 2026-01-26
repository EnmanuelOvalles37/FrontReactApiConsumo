
import { Outlet } from "react-router-dom";
import Tabs from "../Componentes/Tabs";

export default function ProveedoresLayout() {
  const tabs = [
    { to: "listado", label: "Proveedores", permiso: "proveedores_usuarios" },
    { to: "usuarios", label: "Usuarios-Proveedor", permiso: "proveedores_usuarios" },
  ];
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Proveedores & Usuarios</h2>
      <Tabs basePath="/proveedores" tabs={tabs} />
      <Outlet />
    </div>
  );
}
