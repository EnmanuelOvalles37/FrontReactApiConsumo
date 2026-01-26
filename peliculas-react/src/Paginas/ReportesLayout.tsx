
import { Outlet } from "react-router-dom";
import Tabs from "../Componentes/Tabs";

export default function ReportesLayout() {
  const tabs = [
    { to: "general", label: "General", permiso: "reportes_generales" },
    { to: "consumos", label: "Consumos", permiso: "reporte_consumos" },
    { to: "corte", label: "Corte", permiso: "reporte_corte" },
    { to: "cxc", label: "CxC", permiso: "reporte_cuentas_por_cobrar" },
    { to: "cxp", label: "CxP", permiso: "reporte_antiguedad_cxp" },
    { to: "antiguedad-cxc", label: "Antigüedad CxC", permiso: "reporte_antiguedad_cxc" },
    { to: "antiguedad-cxp", label: "Antigüedad CxP", permiso: "reporte_antiguedad_cxp" },
  ];
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Reportes</h2>
      <Tabs basePath="/reportes" tabs={tabs} />
      <Outlet />
    </div>
  );
}
