import { useEffect, useState } from "react";
import api from "../../Servicios/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: number;
}

interface Estadisticas {
  usuario: {
    id: number;
    nombre: string;
    activo: boolean;
    ultimoLogin: string | null;
    totalLogins: number;
    fechaCreacion: string | null;
    rol: string | null;
  };
  asignaciones: Array<{
    id: number;
    rol: string | null;
    activo: boolean;
    proveedor: string;
    tienda: string | null;
    caja: string | null;
  }>;
  periodo: { desde: string; hasta: string };
  resumen: {
    totalConsumos: number;
    montoTotal: number;
    consumosReversados: number;
    promedioPoConsumo: number;
  };
  consumosPorDia: Array<{
    fecha: string;
    cantidad: number;
    monto: number;
  }>;
}

export default function EstadisticasUsuarioModal({ isOpen, onClose, usuarioId }: Props) {
  const [data, setData] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && usuarioId) {
      loadData();
    }
  }, [isOpen, usuarioId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result } = await api.get(`/usuarios-gestion/${usuarioId}/estadisticas`);
      setData(result);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Nunca";
    return new Date(dateStr).toLocaleString("es-DO");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-DO", { 
      weekday: "short", 
      day: "numeric", 
      month: "short" 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">📊 Estadísticas del Usuario</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">Cargando estadísticas...</div>
          ) : !data ? (
            <div className="text-center py-8 text-red-600">Error al cargar datos</div>
          ) : (
            <div className="space-y-6">
              {/* Info del usuario */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                  data.usuario.activo ? "bg-sky-600" : "bg-gray-400"
                }`}>
                  {data.usuario.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    {data.usuario.nombre}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      data.usuario.activo 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {data.usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-500">
                    {data.usuario.rol || "Cajero"} • {data.usuario.totalLogins} logins
                  </p>
                  <p className="text-xs text-gray-400">
                    Último acceso: {formatDateTime(data.usuario.ultimoLogin)}
                  </p>
                </div>
              </div>

              {/* Asignaciones */}
              {data.asignaciones.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Asignaciones:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.asignaciones.map((asig) => (
                      <span
                        key={asig.id}
                        className={`px-3 py-1 rounded-full text-xs ${
                          asig.activo ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {asig.proveedor}
                        {asig.tienda && ` → ${asig.tienda}`}
                        {asig.caja && ` → ${asig.caja}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-sky-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-sky-600">Consumos</p>
                  <p className="text-xl font-bold text-sky-700">{data.resumen.totalConsumos}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600">Monto Total</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(data.resumen.montoTotal)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-600">Reversados</p>
                  <p className="text-xl font-bold text-red-700">{data.resumen.consumosReversados}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-600">Promedio</p>
                  <p className="text-lg font-bold text-gray-700">{formatCurrency(data.resumen.promedioPoConsumo)}</p>
                </div>
              </div>

              {/* Actividad por día */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Actividad (últimos 30 días):</p>
                {data.consumosPorDia.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.consumosPorDia.slice(0, 10).map((dia) => {
                      const maxMonto = Math.max(...data.consumosPorDia.map(d => d.monto), 1);
                      const pct = (dia.monto / maxMonto) * 100;
                      return (
                        <div key={dia.fecha} className="flex items-center gap-3">
                          <div className="w-20 text-xs text-gray-500">{formatDate(dia.fecha)}</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-sky-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs">
                              {dia.cantidad} • {formatCurrency(dia.monto)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Sin actividad en los últimos 30 días
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border hover:bg-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}