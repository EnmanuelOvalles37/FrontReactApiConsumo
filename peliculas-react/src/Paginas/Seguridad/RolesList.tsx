// src/Paginas/Seguridad/RolesList.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { rolesApi } from "../../Servicios/rolesApi";
import type { Rol } from "../../assets/types/seguridad";
import { useAuth } from "../../Context/AuthContext";

export default function RolesList(){
  const { hasPermission } = useAuth();
  

  const [rows,setRows]=useState<Rol[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ (async()=>{
    setLoading(true);
    const data = await rolesApi.list();
    setRows(data);
    setLoading(false);
  })();},[]);

  if (!hasPermission("admin_roles")) return <div className="p-4">No autorizado</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Roles</h2>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-3" colSpan={3}>Cargando…</td></tr>}
            {!loading && rows.length===0 && <tr><td className="px-4 py-3" colSpan={3}>Sin roles</td></tr>}
            {!loading && rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.nombre}</td>
                <td className="px-4 py-2">{r.descripcion ?? "-"}</td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/seguridad/roles/${r.id}`} className="px-3 py-1.5 rounded border hover:bg-gray-50">Permisos</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
