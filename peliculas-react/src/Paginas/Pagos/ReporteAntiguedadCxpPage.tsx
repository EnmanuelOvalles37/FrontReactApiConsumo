// src/Paginas/Pagos/ReporteAntiguedadCxpPage.tsx
// Reporte de antigüedad de cuentas por pagar (30/60/90 días)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportesPagosApi, type CxpDocumentoListItem } from "../../Servicios/pagosApi";

interface AntiguedadData {
  resumen: {
    corriente: number;
    de1a30Dias: number;
    de31a60Dias: number;
    de61a90Dias: number;
    mas90Dias: number;
    total: number;
  };
  detalle: {
    corriente: CxpDocumentoListItem[];
    de1a30Dias: CxpDocumentoListItem[];
    de31a60Dias: CxpDocumentoListItem[];
    de61a90Dias: CxpDocumentoListItem[];
    mas90Dias: CxpDocumentoListItem[];
  };
}

export default function ReporteAntiguedadCxpPage() {
  const [data, setData] = useState<AntiguedadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await reportesPagosApi.antiguedadCxp();
      setData(result as AntiguedadData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-DO");
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando reporte...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">
          Error al cargar el reporte
        </div>
      </div>
    );
  }

  const sections = [
    { key: "corriente", label: "Corriente", color: "green", data: data.detalle.corriente, monto: data.resumen.corriente },
    { key: "de1a30Dias", label: "1-30 días", color: "yellow", data: data.detalle.de1a30Dias, monto: data.resumen.de1a30Dias },
    { key: "de31a60Dias", label: "31-60 días", color: "orange", data: data.detalle.de31a60Dias, monto: data.resumen.de31a60Dias },
    { key: "de61a90Dias", label: "61-90 días", color: "red", data: data.detalle.de61a90Dias, monto: data.resumen.de61a90Dias },
    { key: "mas90Dias", label: "+90 días", color: "purple", data: data.detalle.mas90Dias, monto: data.resumen.mas90Dias },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; light: string }> = {
      green: { bg: "bg-green-500", text: "text-green-700", border: "border-green-200", light: "bg-green-50" },
      yellow: { bg: "bg-yellow-500", text: "text-yellow-700", border: "border-yellow-200", light: "bg-yellow-50" },
      orange: { bg: "bg-orange-500", text: "text-orange-700", border: "border-orange-200", light: "bg-orange-50" },
      red: { bg: "bg-red-500", text: "text-red-700", border: "border-red-200", light: "bg-red-50" },
      purple: { bg: "bg-purple-500", text: "text-purple-700", border: "border-purple-200", light: "bg-purple-50" },
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link to="/pagos" className="hover:text-gray-700">Pagos</Link>
          <span>→</span>
          <Link to="/pagos/reportes" className="hover:text-gray-700">Reportes</Link>
          <span>→</span>
          <span className="text-gray-900">Antigüedad CxP</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Reporte de Antigüedad - Cuentas por Pagar</h1>
        <p className="text-sm text-gray-500 mt-1">Análisis de deudas con proveedores por días de vencimiento</p>
      </div>

      {/* Resumen visual */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Resumen por Antigüedad</h2>
        
        {/* Barra de distribución */}
        <div className="mb-6">
          <div className="h-10 rounded-full overflow-hidden flex">
            {sections.map((section) => {
              const pct = data.resumen.total > 0 ? (section.monto / data.resumen.total) * 100 : 0;
              if (pct === 0) return null;
              const colors = getColorClasses(section.color);
              return (
                <div
                  key={section.key}
                  className={`${colors.bg} h-full transition-all relative group cursor-pointer`}
                  style={{ width: `${pct}%` }}
                  title={`${section.label}: ${formatCurrency(section.monto)} (${pct.toFixed(1)}%)`}
                >
                  {pct > 10 && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                      {pct.toFixed(0)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {sections.map((section) => {
              const colors = getColorClasses(section.color);
              return (
                <div key={section.key} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded ${colors.bg}`}></div>
                  <span className="text-gray-600">{section.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totales por sección */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sections.map((section) => {
            const colors = getColorClasses(section.color);
            return (
              <div key={section.key} className={`${colors.light} rounded-xl p-4 text-center`}>
                <p className={`text-sm ${colors.text}`}>{section.label}</p>
                <p className={`text-lg font-bold ${colors.text}`}>{formatCurrency(section.monto)}</p>
                <p className="text-xs text-gray-500">{section.data.length} docs</p>
              </div>
            );
          })}
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(data.resumen.total)}</p>
          </div>
        </div>
      </div>

      {/* Detalle por sección */}
      <div className="space-y-4">
        {sections.map((section) => {
          const colors = getColorClasses(section.color);
          const isExpanded = expandedSection === section.key;

          return (
            <div key={section.key} className="bg-white rounded-2xl shadow overflow-hidden">
              <button
                onClick={() => toggleSection(section.key)}
                className={`w-full px-6 py-4 flex items-center justify-between ${colors.light} hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${colors.bg}`}></div>
                  <span className={`font-semibold ${colors.text}`}>{section.label}</span>
                  <span className="text-gray-500 text-sm">({section.data.length} documentos)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${colors.text}`}>{formatCurrency(section.monto)}</span>
                  <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
                </div>
              </button>

              {isExpanded && section.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Documento</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Proveedor</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Fact. Proveedor</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Vencimiento</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">Pendiente</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-600">Días Vencido</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.data.map((doc) => (
                        <tr key={doc.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{doc.numeroDocumento}</td>
                          <td className="px-4 py-2">{doc.proveedorNombre}</td>
                          <td className="px-4 py-2">{doc.numeroFacturaProveedor || "—"}</td>
                          <td className="px-4 py-2">{formatDate(doc.fechaVencimiento)}</td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(doc.montoPendiente)}</td>
                          <td className="px-4 py-2 text-center">
                            {doc.diasVencido > 0 ? (
                              <span className="text-red-600 font-medium">{doc.diasVencido}</span>
                            ) : (
                              <span className="text-green-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <Link
                              to={`/pagos/proveedores/documento/${doc.id}`}
                              className="text-sky-600 hover:underline text-xs"
                            >
                              Ver
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isExpanded && section.data.length === 0 && (
                <div className="px-6 py-4 text-gray-500 text-sm">
                  No hay documentos en esta categoría
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}