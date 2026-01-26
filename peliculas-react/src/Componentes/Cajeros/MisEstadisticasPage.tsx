
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";
import CambiarContrasenaModal from "../../Componentes/Usuarios/CambiarContrasenaModal";

interface Estadisticas {
  usuario: {
    nombre: string;
    ultimoLogin: string | null;
    totalLogins: number;
    fechaCreacion: string | null;
    rol: string | null;
  };
  periodo: { desde: string; hasta: string };
  resumen: {
    totalConsumos: number;
    montoTotal: number;
    consumosReversados: number;
    promedioPoConsumo: number;
  };
  hoy: {
    consumos: number;
    monto: number;
  };
  consumosPorDia: Array<{
    fecha: string;
    cantidad: number;
    monto: number;
  }>;
}

export default function MisEstadisticasPage() {
  const [data, setData] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCambiarContrasena, setShowCambiarContrasena] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result } = await api.get("/usuarios-gestion/mis-estadisticas");
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando estadísticas...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">
          Error al cargar las estadísticas
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mis Estadísticas</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de tu actividad como cajero</p>
      </div>

      {/* Info del usuario */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-600">
              {data.usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{data.usuario.nombre}</h2>
              <p className="text-sm text-gray-500">
                {data.usuario.rol || "Cajero"} • {data.usuario.totalLogins} inicios de sesión
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Último acceso: {formatDateTime(data.usuario.ultimoLogin)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCambiarContrasena(true)}
            className="px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm"
          >
            🔐 Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Estadísticas de hoy */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-sky-50 rounded-2xl p-4">
          <p className="text-sm text-sky-600">Consumos Hoy</p>
          <p className="text-3xl font-bold text-sky-700">{data.hoy.consumos}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-sm text-green-600">Monto Hoy</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(data.hoy.monto)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-sm text-gray-500">Total (30 días)</p>
          <p className="text-2xl font-bold">{data.resumen.totalConsumos}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-sm text-gray-500">Monto (30 días)</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(data.resumen.montoTotal)}</p>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Promedio por Consumo</p>
          <p className="text-xl font-bold text-gray-700">
            {formatCurrency(data.resumen.promedioPoConsumo)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Reversados</p>
          <p className="text-xl font-bold text-red-600">
            {data.resumen.consumosReversados}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm text-gray-500">Tasa de Éxito</p>
          <p className="text-xl font-bold text-green-600">
            {data.resumen.totalConsumos > 0 
              ? ((1 - data.resumen.consumosReversados / data.resumen.totalConsumos) * 100).toFixed(1)
              : 100}%
          </p>
        </div>
      </div>

      {/* Gráfico de consumos por día */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Actividad Últimos 7 Días</h3>
        {data.consumosPorDia.length > 0 ? (
          <div className="space-y-3">
            {data.consumosPorDia.slice(0, 7).map((dia) => {
              const maxMonto = Math.max(...data.consumosPorDia.map(d => d.monto), 1);
              const pct = (dia.monto / maxMonto) * 100;
              return (
                <div key={dia.fecha} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-500">{formatDate(dia.fecha)}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {dia.cantidad} consumos • {formatCurrency(dia.monto)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay actividad registrada en los últimos 7 días</p>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="mt-6 flex gap-3">
        <Link
          to="/consumos/nuevo"
          className="px-6 py-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
        >
          ➕ Registrar Consumo
        </Link>
        <Link
          to="/modulo-consumos/lista?soloMisConsumos=true"
          className="px-6 py-3 rounded-xl border hover:bg-gray-50"
        >
          📋 Ver Mis Consumos
        </Link>
      </div>

      {/* Modal cambiar contraseña */}
      <CambiarContrasenaModal
        isOpen={showCambiarContrasena}
        onClose={() => setShowCambiarContrasena(false)}
      />
    </div>
  );
}