/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Consumos/RegistroConsumoPage.tsx
// Formulario de registro de consumos - Con impresión de comprobante
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";
import ModalImpresion from "../../Componentes/Comprobantes/ModalImpresion";
import { type DatosComprobante } from "../../Componentes/Comprobantes/ComprobanteTicket";

type ClienteMatch = {
  clienteId: number;
  empresaId: number;
  empresaNombre: string;
  nombre: string;
  saldo: number;
  cedula?: string;
};

type Consumo = {
  id: number;
  fecha: string;
  clienteNombre: string;
  clienteCedula: string;
  empresaNombre: string;
  monto: number;
  concepto?: string;
  reversado: boolean;
};

type Contexto = {
  proveedorId: number;
  tiendaId: number;
  cajaId: number;
  cajaNombre?: string;
  tiendaNombre?: string;
  proveedorNombre?: string;
};

export default function RegistroConsumoPage() {
  const navigate = useNavigate();
  const cedulaInputRef = useRef<HTMLInputElement>(null);
  const montoInputRef = useRef<HTMLInputElement>(null);

  // Estados del formulario
  const [cedula, setCedula] = useState("");
  const [monto, setMonto] = useState<string>("");
  const [factura, setFactura] = useState("");
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cliente, setCliente] = useState<ClienteMatch | null>(null);

  // Estados del contexto
  const [contexto, setContexto] = useState<Contexto | null>(null);
  const [loadingContexto, setLoadingContexto] = useState(true);

  // Estados de consumos del día
  const [consumosHoy, setConsumosHoy] = useState<Consumo[]>([]);
  const [totalHoy, setTotalHoy] = useState({ cantidad: 0, monto: 0 });

  // ==========================================
  // ESTADOS PARA MODAL DE IMPRESIÓN
  // ==========================================
  const [modalImpresionOpen, setModalImpresionOpen] = useState(false);
  const [datosComprobante, setDatosComprobante] = useState<DatosComprobante | null>(null);
  const [tipoOperacion, setTipoOperacion] = useState<"CONSUMO" | "REVERSO">("CONSUMO");

  // Cargar contexto al montar
  useEffect(() => {
    loadContexto();
  }, []);

  // Cargar consumos cuando tengamos el contexto
  useEffect(() => {
    if (contexto) {
      loadConsumosHoy();
    }
  }, [contexto]);

  // Focus en cédula al montar
  useEffect(() => {
    if (!loadingContexto) {
      cedulaInputRef.current?.focus();
    }
  }, [loadingContexto]);

  const loadContexto = async () => {
    try {
      const { data } = await api.get("/auth/contexto");
      setContexto(data);
      localStorage.setItem("userContexto", JSON.stringify(data));
    } catch (e) {
      console.error("Error cargando contexto:", e);
      const saved = localStorage.getItem("userContexto");
      if (saved) {
        setContexto(JSON.parse(saved));
      } else {
        setErr("No se pudo cargar el contexto del usuario. Contacta al administrador.");
      }
    } finally {
      setLoadingContexto(false);
    }
  };

  const loadConsumosHoy = async () => {
    if (!contexto) return;
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const { data } = await api.get(
        `/cajas/${contexto.cajaId}/consumos?desde=${hoy}&hasta=${hoy}`
      );
      const consumos = data.data || [];
      setConsumosHoy(consumos);
      
      // Calcular totales (solo no reversados)
      const activos = consumos.filter((c: Consumo) => !c.reversado);
      setTotalHoy({
        cantidad: activos.length,
        monto: activos.reduce((acc: number, c: Consumo) => acc + c.monto, 0)
      });
    } catch (e) {
      console.error("Error cargando consumos:", e);
    }
  };

  const formatCedula = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 10)}-${nums.slice(10)}`;
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCedula(e.target.value);
    setCedula(formatted);
    
    // Limpiar cliente si cambia la cédula
    if (cliente) {
      setCliente(null);
    }
  };

  const buscarCliente = async () => {
    setErr(null);
    setCliente(null);

    const ced = (cedula ?? "").replace(/\D/g, "");
    if (!ced || ced.length < 9) {
      setErr("Ingresa una cédula válida");
      return;
    }

    setBuscando(true);
    try {
      const { data } = await api.get(`/clientes/cedula/${encodeURIComponent(ced)}`);

      if (Array.isArray(data?.matches) && data.matches.length > 0) {
        setCliente(data.matches[0]);
        // Focus en monto después de encontrar cliente
        setTimeout(() => montoInputRef.current?.focus(), 100);
      } else {
        setErr("Cliente no encontrado");
      }
    } catch (e: any) {
      setErr(e?.response?.status === 404 ? "Cliente no encontrado" : "Error consultando cliente");
    } finally {
      setBuscando(false);
    }
  };

  // ==========================================
  // FUNCIÓN REGISTRAR CON MODAL DE IMPRESIÓN
  // ==========================================
  const registrar = async () => {
    if (!contexto) {
      setErr("No se ha cargado el contexto. Recarga la página.");
      return;
    }

    if (!cliente) {
      setErr("Debe buscar un cliente válido");
      return;
    }

    const montoNum = parseFloat(monto) || 0;

    if (montoNum <= 0) {
      setErr("El monto debe ser mayor a 0");
      return;
    }

    if (montoNum > cliente.saldo) {
      setErr(`Saldo insuficiente. Disponible: RD$${cliente.saldo.toLocaleString()}`);
      return;
    }

    try {
      setLoading(true);
      setErr(null);
      setExito(null);

      // Guardar saldo anterior antes del consumo
      const saldoAnterior = cliente.saldo;

      const response = await api.post("/consumos", {
        clienteId: cliente.clienteId,
        proveedorId: contexto.proveedorId,
        tiendaId: contexto.tiendaId,
        cajaId: contexto.cajaId,
        monto: montoNum,
        concepto: factura || null,
        nota: nota || null,
      });

      // ==========================================
      // PREPARAR DATOS PARA EL COMPROBANTE
      // ==========================================
      const datosParaComprobante: DatosComprobante = {
        tipo: "CONSUMO",
        id: response.data.Id || response.data.id || Date.now(),
        fecha: new Date().toISOString(),
        monto: montoNum,
        concepto: factura || null,
        referencia: response.data.referencia || null,
        
        clienteNombre: cliente.nombre,
        clienteCedula: cedula.replace(/\D/g, ""),
        clienteSaldoAnterior: saldoAnterior,
        clienteSaldoNuevo: saldoAnterior - montoNum,
        
        empresaNombre: cliente.empresaNombre,
        empresaRnc: null,
        
        proveedorNombre: contexto.proveedorNombre || "Proveedor",
        tiendaNombre: contexto.tiendaNombre || null,
        cajaNombre: contexto.cajaNombre || null,
        
        cajeroNombre: localStorage.getItem("userName") || null,
      };

      setDatosComprobante(datosParaComprobante);
      setTipoOperacion("CONSUMO");
      setModalImpresionOpen(true);

      // NO limpiar el formulario aquí, esperar a que se cierre el modal

    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Error al registrar el consumo");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CALLBACK CUANDO SE CIERRA EL MODAL
  // ==========================================
  const handleImpresionCompleta = () => {
    setModalImpresionOpen(false);
    setDatosComprobante(null);
    
    if (tipoOperacion === "CONSUMO") {
      // Flujo de consumo: limpiar formulario
      limpiarFormulario();
      loadConsumosHoy();
      setExito("Consumo registrado correctamente");
      setTimeout(() => setExito(null), 4000);
      setTimeout(() => cedulaInputRef.current?.focus(), 100);
    } else {
      // Flujo de reverso: solo recargar lista
      loadConsumosHoy();
      setExito("Consumo reversado exitosamente");
      setTimeout(() => setExito(null), 3000);
    }
  };

  const limpiarFormulario = () => {
    setCedula("");
    setCliente(null);
    setMonto("");
    setFactura("");
    setNota("");
  };

  // ==========================================
  // REVERSAR CON MODAL DE IMPRESIÓN
  // ==========================================
  const handleReversar = async (consumoId: number) => {
    console.log("🔄 Iniciando reverso para consumoId:", consumoId);
    
    if (!confirm("¿Estás seguro de reversar este consumo?")) return;

    // Obtener datos del consumo ANTES de reversar
    console.log("📋 Consumos disponibles:", consumosHoy);
    const consumoOriginal = consumosHoy.find(c => c.id === consumoId);
    console.log("🔍 Consumo encontrado:", consumoOriginal);
    
    if (!consumoOriginal) {
      setErr("No se encontró el consumo en la lista");
      return;
    }

    try {
      console.log("📤 Enviando reverso al API...");
      await api.post(`/consumos/${consumoId}/reversar`);
      console.log("✅ Reverso exitoso en API");

      // Preparar datos para comprobante de reverso
      console.log("📄 Contexto actual:", contexto);
      if (contexto) {
        const datosReverso: DatosComprobante = {
          tipo: "REVERSO",
          id: consumoId,
          fecha: new Date().toISOString(),
          monto: consumoOriginal.monto,
          concepto: consumoOriginal.concepto || null,
          
          clienteNombre: consumoOriginal.clienteNombre,
          clienteCedula: consumoOriginal.clienteCedula || null,
          
          empresaNombre: consumoOriginal.empresaNombre,
          
          proveedorNombre: contexto.proveedorNombre || "Proveedor",
          tiendaNombre: contexto.tiendaNombre || null,
          cajaNombre: contexto.cajaNombre || null,
          
          cajeroNombre: localStorage.getItem("userName") || null,
          motivoReverso: "Solicitud del cliente",
        };

        console.log("📝 Datos del comprobante:", datosReverso);
        console.log("🖨️ Abriendo modal de impresión...");
        
        setDatosComprobante(datosReverso);
        setTipoOperacion("REVERSO");
        setModalImpresionOpen(true);
        
        console.log("✅ Estados actualizados - modal debería abrirse");
      } else {
        console.log("⚠️ No hay contexto, mostrando solo mensaje de éxito");
        setExito("Consumo reversado exitosamente");
        loadConsumosHoy();
        setTimeout(() => setExito(null), 3000);
      }
    } catch (e: any) {
      console.error("❌ Error en reverso:", e);
      setErr(e?.response?.data?.message || "Error reversando consumo");
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loadingContexto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Registrar Consumo</h1>
                  {contexto && (
                    <p className="text-sm text-gray-500">
                      {contexto.proveedorNombre || ""} • {contexto.tiendaNombre} • {contexto.cajaNombre}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Resumen del día */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Hoy</p>
                <p className="font-semibold text-gray-900">{totalHoy.cantidad} consumos</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-green-600">{formatCurrency(totalHoy.monto)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Formulario - 3 columnas */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Mensajes */}
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 animate-shake">
                <span className="text-xl">⚠️</span>
                <p>{err}</p>
                <button onClick={() => setErr(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
              </div>
            )}
            
            {exito && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-3">
                <span className="text-xl">✅</span>
                <p>{exito}</p>
              </div>
            )}

            {/* Card principal del formulario */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Paso 1: Buscar Cliente */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    cliente ? "bg-green-500 text-white" : "bg-sky-500 text-white"
                  }`}>
                    {cliente ? "✓" : "1"}
                  </div>
                  <h2 className="font-semibold text-gray-900">Buscar Cliente</h2>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      ref={cedulaInputRef}
                      type="text"
                      value={cedula}
                      onChange={handleCedulaChange}
                      onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
                      placeholder="000-0000000-0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-lg transition-shadow"
                      maxLength={13}
                    />
                    {buscando && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={buscarCliente}
                    disabled={buscando}
                    className="px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {buscando ? "..." : "Buscar"}
                  </button>
                </div>
              </div>

              {/* Info del cliente */}
              {cliente && (
                <div className="p-6 bg-gradient-to-r from-sky-50 to-sky-100/50 border-b border-sky-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-sky-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm">
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{cliente.nombre}</h3>
                        <p className="text-sky-700">{cliente.empresaNombre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Saldo Disponible</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(cliente.saldo)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Monto y detalles */}
              <div className={`p-6 transition-opacity ${!cliente ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    cliente ? "bg-sky-500 text-white" : "bg-gray-300 text-gray-500"
                  }`}>
                    2
                  </div>
                  <h2 className="font-semibold text-gray-900">Detalles del Consumo</h2>
                </div>

                <div className="space-y-4">
                  {/* Monto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto a consumir
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                        RD$
                      </span>
                      <input
                        ref={montoInputRef}
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && cliente && registrar()}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={!cliente}
                        className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-2xl font-bold transition-shadow"
                      />
                    </div>
                    {cliente && parseFloat(monto) > cliente.saldo && (
                      <p className="text-red-500 text-sm mt-2">
                        ⚠️ El monto excede el saldo disponible
                      </p>
                    )}
                  </div>

                  {/* Factura / Concepto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Factura / Concepto <span className="text-gray-400">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={factura}
                      onChange={(e) => setFactura(e.target.value)}
                      placeholder="Ej: FAC-001234"
                      disabled={!cliente}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  {/* Nota */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nota <span className="text-gray-400">(opcional)</span>
                    </label>
                    <textarea
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      rows={2}
                      placeholder="Observaciones adicionales..."
                      disabled={!cliente}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
                <button
                  onClick={limpiarFormulario}
                  disabled={loading}
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={registrar}
                  disabled={loading || !cliente || !monto || parseFloat(monto) <= 0}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </span>
                  ) : (
                    "💳 Registrar Consumo"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de consumos del día - 2 columnas */}
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Consumos de Hoy</h2>
                  <button
                    onClick={loadConsumosHoy}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Actualizar"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                {consumosHoy.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">📋</span>
                    </div>
                    <p className="text-gray-500">No hay consumos registrados hoy</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {consumosHoy.map((consumo) => (
                      <div
                        key={consumo.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          consumo.reversado ? "bg-gray-50 opacity-60" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {consumo.clienteNombre}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {consumo.empresaNombre}
                            </p>
                            {consumo.concepto && (
                              <p className="text-xs text-gray-400 mt-1 truncate">
                                {consumo.concepto}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(consumo.fecha)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-bold ${
                              consumo.reversado ? "text-gray-400 line-through" : "text-gray-900"
                            }`}>
                              {formatCurrency(consumo.monto)}
                            </p>
                            {consumo.reversado ? (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                                Reversado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleReversar(consumo.id)}
                                className="mt-1 text-xs text-red-500 hover:text-red-700 hover:underline"
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

              {/* Footer con total */}
              {consumosHoy.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{totalHoy.cantidad} consumos activos</span>
                    <span className="font-bold text-green-600">{formatCurrency(totalHoy.monto)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ==========================================
          MODAL DE IMPRESIÓN - OBLIGATORIO
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