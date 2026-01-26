// src/views/cuentas/CuentasLayout.tsx
import { Outlet } from "react-router-dom";
import Tabs from "../Componentes/Tabs";


export default function CuentasLayout() {
  const tabs = [
    { to: "cobrar", label: "CxC", permiso: "cuentas_por_cobrar" },
    { to: "aplicar-cobro", label: "Aplicar Cobro", permiso: "registrar_cobro" },
    { to: "pagar", label: "CxP", permiso: "cuentas_por_pagar" },
    { to: "aplicar-pago", label: "Aplicar Pago", permiso: "aplicar_pago" },
  ];
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Cuentas</h2>
      <Tabs basePath="/cuentas" tabs={tabs} />      
      <Outlet />
    </div>
  );
}
