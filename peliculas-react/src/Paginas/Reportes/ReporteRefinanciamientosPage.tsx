/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Reportes/ReporteRefinanciamientosPage.tsx
import { useState, useEffect } from "react";
//import axios from "axios";
import ReporteLayout, { 
  ResumenCard,
  formatCurrency, 
  formatDate, 
  exportToCSV
} from "../Reportes/ReporteLayout";
import api from "../../Servicios/api";

interface Refinanciamiento {
  id: number;
  numeroRefinanciamiento: string;
  empresaNombre: string;
  fecha: string;
  fechaVencimiento: string;
  montoOriginal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  motivo: string;
  diasRestantes: number;
}

interface Empresa { id: number; nombre: string; }

const ESTADOS = [
  { valor: "", label: "Todos" },
  { valor: "0", label: "Pendiente" },
  { valor: "1", label: "Pagado" },
  { valor: "2", label: "Parcial" },
  { valor: "3", label: "Vencido" },
  { valor: "4", label: "Castigado" }
];

function getEstadoRefinanciamiento(estado: number): string {
  const nombres: Record<number, string> = {
    0: "Pendiente",
    1: "Pagado",
    2: "Parcial",
    3: "Vencido",
    4: "Castigado"
  };
  return nombres[estado] || "Desconocido";
}

function getEstadoColor(estado: number): string {
  const colores: Record<number, string> = {
    0: "bg-amber-100 text-amber-700",
    1: "bg-green-100 text-green-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-red-100 text-red-700",
    4: "bg-gray-100 text-gray-700"
  };
  return colores[estado] || "bg-gray-100 text-gray-500";
}

export default function ReporteRefinanciamientosPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Refinanciamiento[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [empresaId, setEmpresaId] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    api.get("/reportes/listas/empresas").then(r => setEmpresas(r.data));
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (empresaId) params.append("empresaId", empresaId);
      if (estado) params.append("estado", estado);
      
      const res = await api.get(`/reportes/refinanciamientos?${params}`);
      setData(res.data.data);
      setResumen(res.data.resumen);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarReporte(); }, []);

  const handleExportExcel = () => {
    exportToCSV(data.map(r => ({
      ...r,
      estadoNombre: getEstadoRefinanciamiento(r.estado),
      fechaFormato: formatDate(r.fecha),
      fechaVencimientoFormato: formatDate(r.fechaVencimiento)
    })), [
      { key: "numeroRefinanciamiento", label: "Numero" },
      { key: "empresaNombre", label: "Empresa" },
      { key: "fechaFormato", label: "Fecha" },
      { key: "fechaVencimientoFormato", label: "Vencimiento" },
      { key: "diasRestantes", label: "Dias Restantes" },
      { key: "montoOriginal", label: "Original" },
      { key: "montoPagado", label: "Pagado" },
      { key: "montoPendiente", label: "Pendiente" },
      { key: "estadoNombre", label: "Estado" },
      { key: "motivo", label: "Motivo" }
    ], "Reporte_Refinanciamientos");
  };

  return (
    <ReporteLayout
      titulo="Refinanciamientos"
      subtitulo="Estado de deudas refinanciadas"
      loading={loading}
      onExportExcel={handleExportExcel}
      filtros={
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Empresa</label>
            <select
              value={empresaId}
              onChange={e => setEmpresaId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg min-w-[200px]"
            >
              <option value="">Todas</option>
              {empresas.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg min-w-[150px]"
            >
              {ESTADOS.map(e => (
                <option key={e.valor} value={e.valor}>{e.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={cargarReporte}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Buscar
          </button>
        </div>
      }
      resumen={
        resumen && (
          <div className="space-y-4">
            {/* Cards principales */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <ResumenCard titulo="Total" valor={resumen.total} icono="#" color="blue" />
              <ResumenCard titulo="Monto Original" valor={formatCurrency(resumen.montoOriginalTotal)} icono="$" color="gray" />
              <ResumenCard titulo="Pagado" valor={formatCurrency(resumen.montoPagadoTotal)} icono="$" color="green" />
              <ResumenCard titulo="Pendiente" valor={formatCurrency(resumen.montoPendienteTotal)} icono="$" color="orange" />
              <ResumenCard titulo="Recuperado" valor={`${resumen.porcentajeRecuperado}%`} icono="%" color="purple" />
            </div>
            
            {/* Por estado */}
            {resumen.porEstado && resumen.porEstado.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {resumen.porEstado.map((e: any) => (
                  <div key={e.estado} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-500">{e.estado}</p>
                    <p className="text-lg font-bold text-gray-900">{e.cantidad}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(e.monto)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }
    >
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <span className="text-4xl mb-4 block">No hay refinanciamientos</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Numero</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Empresa</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Vencimiento</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Dias</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Original</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Pagado</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Pendiente</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{r.numeroRefinanciamiento}</td>
                  <td className="px-4 py-3 text-gray-600">{r.empresaNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.fecha)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.fechaVencimiento)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${r.diasRestantes < 0 ? "text-red-600" : r.diasRestantes <= 7 ? "text-amber-600" : "text-green-600"}`}>
                      {r.diasRestantes < 0 ? `Vencido ${Math.abs(r.diasRestantes)}d` : `${r.diasRestantes}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(r.montoOriginal)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatCurrency(r.montoPagado)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(r.montoPendiente)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(r.estado)}`}>
                      {getEstadoRefinanciamiento(r.estado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={5} className="px-4 py-3 text-right">Totales:</td>
                <td className="px-4 py-3 text-right">{formatCurrency(resumen?.montoOriginalTotal)}</td>
                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(resumen?.montoPagadoTotal)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(resumen?.montoPendienteTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </ReporteLayout>
  );
}