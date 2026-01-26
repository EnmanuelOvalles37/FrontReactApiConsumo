/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Dashboard/DashboardCajero.tsx
// Dashboard del cajero con impresión de comprobantes en reversos
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";
import LogoutButton from "../../Componentes/LogoutButton";
import CambiarContrasenaModal from "../../Componentes/Usuarios/CambiarContrasenaModal";
import ModalImpresion from "../../Componentes/Comprobantes/ModalImpresion";
import { type DatosComprobante } from "../../Componentes/Comprobantes/ComprobanteTicket";

type EstadisticasCajero = {
  consumosHoy: number;
  montoHoy: number;
  consumosSemana: number;
  montoSemana: number;
};

type Consumo = {
  id: number;
  fecha: string;
  clienteNombre: string;
  clienteCedula: string;
  empresaNombre?: string;
  monto: number;
  concepto?: string;
  reversado: boolean;
};

type Contexto = {
  proveedorId: number;
  proveedorNombre?: string;
  tiendaId: number;
  tiendaNombre?: string;
  cajaId: number;
  cajaNombre?: string;
  rol?: string;
};

export default function DashboardCajero() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [contexto, setContexto] = useState<Contexto | null>(null);
  const [stats, setStats] = useState<EstadisticasCajero>({
    consumosHoy: 0,
    montoHoy: 0,
    consumosSemana: 0,
    montoSemana: 0,
  });
  const [ultimosConsumos, setUltimosConsumos] = useState<Consumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal de cambiar contraseña
  const [showCambiarContrasena, setShowCambiarContrasena] = useState(false);

  // ==========================================
  // ESTADOS PARA MODAL DE IMPRESIÓN
  // ==========================================
  const [modalImpresionOpen, setModalImpresionOpen] = useState(false);
  const [datosComprobante, setDatosComprobante] = useState<DatosComprobante | null>(null);

  // Función para obtener fecha local en formato YYYY-MM-DD
  const getLocalDateString = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) Cargar contexto del usuario
      const contextoRes = await api.get("/auth/contexto");
      const ctx = contextoRes.data;
      setContexto(ctx);

      // Si no tiene caja asignada, mostrar error
      if (!ctx.cajaId) {
        setError("No tienes una caja asignada. Contacta al administrador.");
        setLoading(false);
        return;
      }

      // 2) Calcular fechas
      const hoy = getLocalDateString();
      const hace7Dias = getLocalDateString(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      // 3) Cargar estadísticas usando el nuevo endpoint
      const [consumosHoyRes, consumosSemanaRes] = await Promise.all([
        api.get(`/cajas/${ctx.cajaId}/consumos`, {
          params: { desde: hoy, hasta: hoy },
        }),
        api.get(`/cajas/${ctx.cajaId}/consumos`, {
          params: { desde: hace7Dias, hasta: hoy },
        }),
      ]);

      // 4) Procesar estadísticas
      const dataHoy = consumosHoyRes.data;
      const dataSemana = consumosSemanaRes.data;

      setStats({
        consumosHoy: dataHoy.resumen?.totalConsumos || 0,
        montoHoy: dataHoy.resumen?.totalMonto || 0,
        consumosSemana: dataSemana.resumen?.totalConsumos || 0,
        montoSemana: dataSemana.resumen?.totalMonto || 0,
      });

      // 5) Últimos 5 consumos de hoy
      const consumosDelDia = dataHoy.data || [];
      setUltimosConsumos(consumosDelDia.slice(0, 5));

      // 6) Registrar login (silencioso)
      api.post("/usuarios-gestion/registrar-login").catch(() => {});

    } catch (err: any) {
      console.error("Error cargando datos:", err);

      if (err?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      } else if (err?.response?.status === 403) {
        setError("No tienes permisos para acceder a esta caja.");
      } else {
        setError(
          err?.response?.data?.message || "Error cargando datos. Intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // REVERSAR CON MODAL DE IMPRESIÓN
  // ==========================================
  const handleReversar = async (consumoId: number) => {
    if (!confirm("¿Estás seguro de reversar este consumo?")) return;

    // Obtener datos del consumo ANTES de reversar
    const consumoOriginal = ultimosConsumos.find(c => c.id === consumoId);
    
    if (!consumoOriginal) {
      alert("No se encontró el consumo en la lista");
      return;
    }

    try {
      await api.post(`/consumos/${consumoId}/reversar`);

      // Preparar datos para comprobante de reverso
      if (contexto) {
        const datosReverso: DatosComprobante = {
          tipo: "REVERSO",
          id: consumoId,
          fecha: new Date().toISOString(),
          monto: consumoOriginal.monto,
          concepto: consumoOriginal.concepto || null,
          
          clienteNombre: consumoOriginal.clienteNombre,
          clienteCedula: consumoOriginal.clienteCedula || null,
          
          empresaNombre: consumoOriginal.empresaNombre || null,
          
          proveedorNombre: contexto.proveedorNombre || "Proveedor",
          tiendaNombre: contexto.tiendaNombre || null,
          cajaNombre: contexto.cajaNombre || null,
          
          cajeroNombre: currentUser?.usuario || null,
          motivoReverso: "Solicitud del cliente",
        };

        setDatosComprobante(datosReverso);
        setModalImpresionOpen(true);
      } else {
        // Si no hay contexto, solo recargar
        loadData();
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error reversando consumo");
    }
  };

  // ==========================================
  // CALLBACK CUANDO SE CIERRA EL MODAL
  // ==========================================
  const handleImpresionCompleta = () => {
    setModalImpresionOpen(false);
    setDatosComprobante(null);
    // Recargar datos después de reversar
    loadData();
  };

  // Formatear moneda
  const formatCurrency = (monto: number) => {
    return `RD$${monto.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  // Formatear fecha
  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-DO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Reintentar
            </button>
            <LogoutButton variant="button" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con opciones de usuario */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contexto?.proveedorNombre || "Panel de Cajero"}
            </h1>
            <p className="text-sm text-gray-500">
              {contexto?.tiendaNombre} • {contexto?.cajaNombre}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <p className="font-medium text-gray-800">{currentUser?.usuario}</p>
              <p className="text-xs text-gray-500 capitalize">
                {contexto?.rol || "Cajero"}
              </p>
            </div>
            
            {/* Botón cambiar contraseña */}
            <button
              onClick={() => setShowCambiarContrasena(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cambiar contraseña"
            >
              🔐
            </button>
            
            <LogoutButton variant="icon" className="text-gray-600" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Saludo */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            ¡Hola, {currentUser?.usuario}!
          </h2>
          <p className="text-gray-600 mt-1">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Consumos Hoy</div>
                <div className="text-3xl font-bold text-sky-600">
                  {stats.consumosHoy}
                </div>
              </div>
              <div className="text-4xl">🧾</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Monto Hoy</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.montoHoy)}
                </div>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Esta Semana</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.consumosSemana}
                </div>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Semana</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.montoSemana)}
                </div>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate("/consumos/nuevo")}
            className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg shadow-lg hover:shadow-xl transition-all p-6 text-left text-white"
          >
            <div className="text-4xl mb-3">💳</div>
            <h3 className="text-xl font-bold mb-1">Registrar Consumo</h3>
            <p className="text-sky-100 text-sm">
              Buscar cliente y registrar consumo
            </p>
          </button>

          <button
            onClick={() => navigate("/mis-consumos")}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all p-6 text-left border-2 border-gray-100"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              Ver Mis Consumos
            </h3>
            <p className="text-gray-600 text-sm">
              Consultar consumos registrados
            </p>
          </button>

          <button
            onClick={() => navigate("/mis-estadisticas")}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all p-6 text-left border-2 border-purple-100 hover:border-purple-200"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              Mis Estadísticas
            </h3>
            <p className="text-gray-600 text-sm">
              Ver historial y rendimiento
            </p>
          </button>
        </div>

        {/* Últimos consumos registrados */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Últimos Consumos de Hoy</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={loadData}
                  className="text-gray-500 hover:text-gray-700"
                  title="Actualizar"
                >
                  🔄
                </button>
                <button
                  onClick={() => navigate("/mis-consumos")}
                  className="text-sky-600 hover:underline text-sm"
                >
                  Ver todos →
                </button>
              </div>
            </div>
          </div>

          {ultimosConsumos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📭</div>
              <p className="text-gray-500">No has registrado consumos hoy</p>
              <button
                onClick={() => navigate("/consumos/nuevo")}
                className="mt-4 text-sky-600 hover:underline"
              >
                Registrar primer consumo
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {ultimosConsumos.map((consumo) => (
                <div
                  key={consumo.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    consumo.reversado ? "opacity-50 bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {consumo.clienteNombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cédula: {consumo.clienteCedula || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(consumo.fecha)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className={`font-bold text-xl ${
                          consumo.reversado ? "text-gray-400 line-through" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(consumo.monto)}
                      </div>
                      {consumo.reversado ? (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded inline-block mt-1">
                          Reversado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReversar(consumo.id)}
                          className="text-xs text-red-600 hover:underline mt-1"
                        >
                          Reversar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con opciones adicionales */}
        <div className="mt-8 flex justify-center gap-4 text-sm">
          <button
            onClick={() => setShowCambiarContrasena(true)}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            🔐 Cambiar contraseña
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => navigate("/mis-estadisticas")}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            📊 Ver estadísticas completas
          </button>
        </div>
      </main>

      {/* Modal Cambiar Contraseña */}
      <CambiarContrasenaModal
        isOpen={showCambiarContrasena}
        onClose={() => setShowCambiarContrasena(false)}
      />

      {/* ==========================================
          MODAL DE IMPRESIÓN - PARA REVERSOS
          ========================================== */}
      <ModalImpresion
        open={modalImpresionOpen}
        datos={datosComprobante}
        onClose={() => setModalImpresionOpen(false)}
        onImpreso={handleImpresionCompleta}
      />
    </div>
  );
}