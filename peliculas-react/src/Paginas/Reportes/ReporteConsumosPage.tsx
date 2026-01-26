// src/Paginas/Reportes/ReporteConsumosPage.tsx
import { useState, useEffect } from "react";

import ReporteLayout, { 
  ResumenCard, 
  formatCurrency, 
  formatDate, 
  exportToCSV 
} from "../Reportes/ReporteLayout";
import api from "../../Servicios/api";

interface Consumo {
  id: number;
  fecha: string;
  empleadoCodigo: string;
  empleadoNombre: string;
  empresaNombre: string;
  proveedorNombre: string;
  tiendaNombre: string;
  monto: number;
  concepto: string;
  referencia: string;
  montoComision: number;
  montoNetoProveedor: number;
}

interface Empresa { id: number; nombre: string; }
interface Proveedor { id: number; nombre: string; }

export default function ReporteConsumosPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Consumo[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumen, setResumen] = useState<any>(null);
  
  // Filtros
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0]);
  const [empresaId, setEmpresaId] = useState<string>("");
  const [proveedorId, setProveedorId] = useState<string>("");
  
  // Listas para filtros
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    api.get("/reportes/listas/empresas").then(r => setEmpresas(r.data));
    api.get("/reportes/listas/proveedores").then(r => setProveedores(r.data));
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("desde", desde);
      params.append("hasta", hasta);
      if (empresaId) params.append("empresaId", empresaId);
      if (proveedorId) params.append("proveedorId", proveedorId);
      
      const res = await api.get(`/reportes/consumos?${params}`);
      setData(res.data.data);
      setResumen(res.data.resumen);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { cargarReporte(); }, []);

  const handleExportExcel = () => {
  exportToCSV<Consumo>(data, [
    { key: "fecha", label: "Fecha" },
    { key: "empleadoCodigo", label: "Código" },
    { key: "empleadoNombre", label: "Empleado" },
    { key: "empresaNombre", label: "Empresa" },
    { key: "proveedorNombre", label: "Proveedor" },
    { key: "tiendaNombre", label: "Tienda" },
    { key: "monto", label: "Monto" },
    { key: "montoComision", label: "Comisión" },
    { key: "montoNetoProveedor", label: "Neto Proveedor" },
    { key: "concepto", label: "Concepto" },
    { key: "referencia", label: "Referencia" }
  ], "Reporte_Consumos");
};

  return (
    <ReporteLayout
      titulo="🛒 Reporte de Consumos"
      subtitulo={`Del ${formatDate(desde)} al ${formatDate(hasta)}`}
      loading={loading}
      onExportExcel={handleExportExcel}
      filtros={
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Empresa</label>
            <select
              value={empresaId}
              onChange={e => setEmpresaId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg min-w-[180px]"
            >
              <option value="">Todas</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
            <select
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg min-w-[180px]"
            >
              <option value="">Todos</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <button
            onClick={cargarReporte}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            🔍 Buscar
          </button>
        </div>
      }
      resumen={
        resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResumenCard titulo="Total Consumos" valor={resumen.totalConsumos} icono="🛒" color="blue" />
            <ResumenCard titulo="Monto Total" valor={formatCurrency(resumen.montoTotal)} icono="💵" color="green" />
            <ResumenCard titulo="Comisión Total" valor={formatCurrency(resumen.comisionTotal)} icono="💰" color="purple" />
            <ResumenCard titulo="Neto Proveedores" valor={formatCurrency(resumen.netoProveedores)} icono="🏪" color="orange" />
          </div>
        )
      }
    >
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <span className="text-4xl mb-4 block">📭</span>
          No hay consumos en el período seleccionado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Empleado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Empresa</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Proveedor</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Monto</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Comisión</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Concepto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.fecha)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{c.empleadoNombre}</span>
                    <span className="text-xs text-gray-400 ml-2">{c.empleadoCodigo}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.empresaNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{c.proveedorNombre}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(c.monto)}</td>
                  <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(c.montoComision)}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{c.concepto || "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={4} className="px-4 py-3 text-right">Totales:</td>
                <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(resumen?.montoTotal)}</td>
                <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(resumen?.comisionTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </ReporteLayout>
  );
}