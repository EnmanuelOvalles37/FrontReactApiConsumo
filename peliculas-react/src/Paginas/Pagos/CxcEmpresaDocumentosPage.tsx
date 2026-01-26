// src/Paginas/Pagos/CxC/CxcEmpresaDocumentosPage.tsx
// Lista de documentos CxC de una empresa específica

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../Servicios/api";


type Documento = {
  id: number;
  numeroDocumento: string;
  periodoDesde: string;
  periodoHasta: string;
  cantidadConsumos: number;
  cantidadEmpleados: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: number;
  estadoNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  diasVencido: number;
};

type Empresa = {
  id: number;
  nombre: string;
  rnc: string;
  diaCorte: number | null;
};

export default function CxcEmpresaDocumentosPage() {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [resumen, setResumen] = useState({ total: 0, pagado: 0, pendiente: 0 });
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "activos">("activos");

  useEffect(() => {
    if (empresaId) loadDocumentos();
  }, [empresaId, filtro]);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cxc/empresas/${empresaId}/documentos`, {
        params: { soloActivos: filtro === "activos" }
      });
      setEmpresa(res.data.empresa);
      setDocumentos(res.data.documentos);
      setResumen(res.data.resumen);
    } catch (error) {
      console.error("Error cargando documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("es-DO");

  const getEstadoBadge = (estado: number, diasVencido: number) => {
    if (estado === 2) return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Pagado</span>;
    if (estado === 3) return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Refinanciado</span>;
    if (estado === 4) return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Anulado</span>;
    if (diasVencido > 0) return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Vencido ({diasVencido}d)</span>;
    if (estado === 1) return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Parcial</span>;
    return <span className="px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">Pendiente</span>;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
            <span className="text-gray-300">/</span>
            <Link to="/pagos/cxc" className="text-gray-400 hover:text-gray-600">CxC</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{empresa?.nombre}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">📄 Documentos CxC</h1>
          <p className="text-gray-500 mt-1">{empresa?.nombre} {empresa?.rnc && `• RNC: ${empresa.rnc}`}</p>
        </div>
        <Link
          to={`/pagos/cxc/generar?empresaId=${empresaId}`}
          className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
        >
          + Nuevo Consolidado
        </Link>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Facturado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumen.total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">Pagado</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(resumen.pagado)}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-700">Pendiente</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(resumen.pendiente)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro("activos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === "activos" ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltro("todos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === "todos" ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {documentos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin documentos</h3>
            <p className="text-gray-500 mb-4">No hay documentos CxC para esta empresa</p>
            <Link
              to={`/pagos/cxc/generar?empresaId=${empresaId}`}
              className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Generar Consolidado
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Documento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Período</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Consumos</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Total</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Pendiente</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Vencimiento</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documentos.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{doc.numeroDocumento}</span>
                      <span className="block text-xs text-gray-500">{formatDate(doc.fechaEmision)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(doc.periodoDesde)} - {formatDate(doc.periodoHasta)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900">{doc.cantidadConsumos}</span>
                      <span className="block text-xs text-gray-500">{doc.cantidadEmpleados} empleados</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(doc.montoTotal)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.montoPendiente > 0 ? (
                        <span className="font-semibold text-amber-600">{formatCurrency(doc.montoPendiente)}</span>
                      ) : (
                        <span className="text-green-600">$0.00</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className={doc.diasVencido > 0 ? "text-red-600 font-medium" : "text-gray-600"}>
                        {formatDate(doc.fechaVencimiento)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getEstadoBadge(doc.estado, doc.diasVencido)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/pagos/cxc/documentos/${doc.id}`)}
                          className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                        >
                          Ver
                        </button>
                        {doc.estado !== 2 && doc.estado !== 5 && (
                          <button
                            onClick={() => navigate(`/pagos/cxc/documentos/${doc.id}/cobrar`)}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                          >
                            Cobrar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}