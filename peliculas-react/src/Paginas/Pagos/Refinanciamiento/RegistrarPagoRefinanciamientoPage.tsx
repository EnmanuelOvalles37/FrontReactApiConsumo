  /*

  /* eslint-disable @typescript-eslint/no-explicit-any /
// src/Paginas/Pagos/Refinanciamientos/RegistrarPagoRefinanciamientoPage.tsx
// Página para registrar pago a un refinanciamiento

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../Servicios/api";


type Refinanciamiento = {
  id: number;
  // Puede venir como objeto anidado o como campos directos
  documento?: {
    id: number;
    numeroDocumento: string;
  };
  documentoId?: number;
  documentoNumero?: string;
  empresa?: {
    id: number;
    nombre: string;
    rnc: string;
  };
  empresaId?: number;
  empresaNombre?: string;
  montoOriginal?: number;
  montoRefinanciado?: number;
  montoPagado?: number;
  montoPendiente?: number;
  fechaRefinanciamiento?: string;
  fecha?: string;
  fechaVencimiento?: string;
  diasRestantes?: number;
  estado?: number;
  estadoNombre?: string;
};

const METODOS_PAGO = [
  { value: 0, label: "Efectivo" },
  { value: 1, label: "Transferencia" },
  { value: 2, label: "Cheque" },
  { value: 3, label: "Tarjeta de Crédito" },
  { value: 4, label: "Tarjeta de Débito" },
  { value: 5, label: "Otro" }
];

export default function RegistrarPagoRefinanciamientoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refinanciamiento, setRefinanciamiento] = useState<Refinanciamiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formulario
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState(1);
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (id) loadRefinanciamiento();
  }, [id]);

  const loadRefinanciamiento = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/refinanciamiento/${id}`);
      
      // Normalizar los datos recibidos
      const data = res.data;
      const normalizado: Refinanciamiento = {
        id: data.id,
        documento: data.documento,
        documentoId: data.documentoId || data.documento?.id || data.cxcDocumentoId,
        documentoNumero: data.documentoNumero || data.documento?.numeroDocumento || data.numeroDocumento || "—",
        empresa: data.empresa,
        empresaId: data.empresaId || data.empresa?.id,
        empresaNombre: data.empresaNombre || data.empresa?.nombre || "Sin nombre",
        montoOriginal: data.montoOriginal ?? data.montoRefinanciado ?? 0,
        montoRefinanciado: data.montoRefinanciado ?? data.montoOriginal ?? 0,
        montoPagado: data.montoPagado ?? 0,
        montoPendiente: data.montoPendiente ?? 0,
        fechaRefinanciamiento: data.fechaRefinanciamiento || data.fecha,
        fecha: data.fecha || data.fechaRefinanciamiento,
        fechaVencimiento: data.fechaVencimiento,
        diasRestantes: data.diasRestantes ?? 0,
        estado: data.estado ?? 0,
        estadoNombre: data.estadoNombre || "Desconocido"
      };
      
      setRefinanciamiento(normalizado);
      
      // Establecer monto pendiente como valor inicial
      if (normalizado.montoPendiente && normalizado.montoPendiente > 0) {
        setMonto(normalizado.montoPendiente.toString());
      }
    } catch (error: any) {
      console.error("Error cargando refinanciamiento:", error);
      setError(error.response?.data?.message || "Error cargando refinanciamiento");
    } finally {
      setLoading(false);
    }
  };

  // Funciones de formateo con validación
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return "RD$0.00";
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("es-DO");
    } catch {
      return "—";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinanciamiento) return;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    const pendiente = refinanciamiento.montoPendiente || 0;
    if (montoNum > pendiente) {
      setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(pendiente)})`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      // Endpoint corregido: sin /api/ duplicado y singular
      const res = await api.post(`/refinanciamiento/${id}/pagos`, {
        monto: montoNum,
        metodoPago,
        referencia: referencia || null,
        notas: notas || null
      });

      setSuccess(res.data.mensaje || "Pago registrado exitosamente");
      
      setTimeout(() => {
        navigate(`/pagos/refinanciamientos/${id}`);
      }, 2000);

    } catch (error: any) {
      setError(error.response?.data?.message || "Error registrando pago");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando refinanciamiento...</p>
        </div>
      </div>
    );
  }

  if (!refinanciamiento) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700">{error || "Refinanciamiento no encontrado"}</p>
          <Link to="/pagos/refinanciamientos" className="text-sky-600 hover:underline mt-2 inline-block">
            Volver a Refinanciamientos
          </Link>
        </div>
      </div>
    );
  }

  // Obtener valores con fallbacks
  const numeroDocumento = refinanciamiento.documentoNumero || refinanciamiento.documento?.numeroDocumento || "—";
  const empresaNombre = refinanciamiento.empresaNombre || refinanciamiento.empresa?.nombre || "Sin nombre";
  const montoPendiente = refinanciamiento.montoPendiente || 0;
  const diasRestantes = refinanciamiento.diasRestantes || 0;
  const fechaVencimiento = refinanciamiento.fechaVencimiento;
  const esVencido = diasRestantes < 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header /}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/refinanciamientos" className="text-gray-400 hover:text-gray-600">Refinanciamientos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Registrar Pago</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">🔄 Pago de Refinanciamiento</h1>
      </div>

      {/* Info del refinanciamiento /}
      <div className={`rounded-2xl p-6 ${esVencido ? "bg-red-50 border border-red-200" : "bg-purple-50 border border-purple-200"}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm ${esVencido ? "text-red-700" : "text-purple-700"}`}>Refinanciamiento</p>
            <p className={`text-xl font-bold ${esVencido ? "text-red-900" : "text-purple-900"}`}>
              {numeroDocumento}
            </p>
            <p className={esVencido ? "text-red-700" : "text-purple-700"}>{empresaNombre}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm ${esVencido ? "text-red-700" : "text-purple-700"}`}>Saldo Pendiente</p>
            <p className={`text-3xl font-bold ${esVencido ? "text-red-900" : "text-purple-900"}`}>
              {formatCurrency(montoPendiente)}
            </p>
          </div>
        </div>

        {/* Estado de vencimiento /}
        <div className={`mt-4 pt-4 border-t ${esVencido ? "border-red-200" : "border-purple-200"} flex items-center justify-between`}>
          <div>
            <p className={`text-sm ${esVencido ? "text-red-600" : "text-purple-600"}`}>Vencimiento</p>
            <p className={`font-semibold ${esVencido ? "text-red-900" : "text-purple-900"}`}>
              {formatDate(fechaVencimiento)}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${esVencido ? "bg-red-100 text-red-700" : diasRestantes <= 7 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
            {esVencido 
              ? `⚠️ Vencido hace ${Math.abs(diasRestantes)} días`
              : diasRestantes === 0 
                ? "⚠️ Vence hoy"
                : `✅ ${diasRestantes} días restantes`
            }
          </div>
        </div>
      </div>

      {/* Formulario /}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="font-semibold text-gray-900 text-lg">Datos del Pago</h2>

        {/* Monto /}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Pagar *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">RD$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={montoPendiente}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-xl font-semibold"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Máximo: {formatCurrency(montoPendiente)}
          </p>
        </div>

        {/* Método de pago /}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            {METODOS_PAGO.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Referencia /}
        {metodoPago !== 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {metodoPago === 2 ? "Número de Cheque" : "Referencia/Confirmación"}
            </label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder={metodoPago === 2 ? "Ej: 001234" : "Ej: TRF-12345"}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Notas /}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Observaciones adicionales..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Error /}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Success /}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            ✅ {success}
          </div>
        )}

        {/* Botones /}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !!success}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
          >
            {saving ? "Registrando..." : `Registrar Pago ${monto ? formatCurrency(parseFloat(monto) || 0) : ""}`}
          </button>
        </div>
      </form>
    </div>
  );
}*/

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/Refinanciamientos/RegistrarPagoRefinanciamientoPage.tsx
// Página para registrar pago a un refinanciamiento

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../../Servicios/api";


type Refinanciamiento = {
  id: number;
  // Puede venir como objeto anidado o como campos directos
  documento?: {
    id: number;
    numeroDocumento: string;
  };
  documentoId?: number;
  documentoNumero?: string;
  empresa?: {
    id: number;
    nombre: string;
    rnc: string;
  };
  empresaId?: number;
  empresaNombre?: string;
  montoOriginal?: number;
  montoRefinanciado?: number;
  montoPagado?: number;
  montoPendiente?: number;
  fechaRefinanciamiento?: string;
  fecha?: string;
  fechaVencimiento?: string;
  diasRestantes?: number;
  estado?: number;
  estadoNombre?: string;
};

const METODOS_PAGO = [
  { value: 0, label: "Efectivo" },
  { value: 1, label: "Transferencia" },
  { value: 2, label: "Cheque" },
  { value: 3, label: "Tarjeta de Crédito" },
  { value: 4, label: "Tarjeta de Débito" },
  { value: 5, label: "Otro" }
];

export default function RegistrarPagoRefinanciamientoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refinanciamiento, setRefinanciamiento] = useState<Refinanciamiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formulario
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState(1);
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (id) loadRefinanciamiento();
  }, [id]);

  const loadRefinanciamiento = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/refinanciamiento/${id}`);
      
      // Normalizar los datos recibidos (el API retorna en PascalCase)
      const data = res.data;
      
      // Log para debug
      console.log("Datos del refinanciamiento:", data);
      
      // Mapear campos - el API usa PascalCase, necesitamos manejar ambos casos
      const normalizado: Refinanciamiento = {
        id: data.Id ?? data.id,
        documento: data.DocumentoOriginal ?? data.documento,
        documentoId: data.CxcDocumentoId ?? data.cxcDocumentoId ?? data.documentoId,
        documentoNumero: data.DocumentoOriginal?.NumeroDocumento ?? 
                        data.documentoOriginal?.numeroDocumento ?? 
                        data.documentoNumero ?? 
                        data.NumeroRefinanciamiento ??
                        "—",
        empresa: data.Empresa ?? data.empresa,
        empresaId: data.EmpresaId ?? data.empresaId ?? data.Empresa?.Id ?? data.empresa?.id,
        empresaNombre: data.Empresa?.Nombre ?? 
                       data.empresa?.nombre ?? 
                       data.empresaNombre ?? 
                       data.EmpresaNombre ??
                       "Sin nombre",
        montoOriginal: data.MontoOriginal ?? data.montoOriginal ?? 0,
        montoRefinanciado: data.MontoOriginal ?? data.montoOriginal ?? data.montoRefinanciado ?? 0,
        montoPagado: data.MontoPagado ?? data.montoPagado ?? 0,
        montoPendiente: data.MontoPendiente ?? data.montoPendiente ?? 0,
        fechaRefinanciamiento: data.Fecha ?? data.fecha ?? data.fechaRefinanciamiento,
        fecha: data.Fecha ?? data.fecha,
        fechaVencimiento: data.FechaVencimiento ?? data.fechaVencimiento,
        diasRestantes: data.DiasRestantes ?? data.diasRestantes ?? calcularDiasRestantes(data.FechaVencimiento ?? data.fechaVencimiento),
        estado: data.Estado ?? data.estado ?? 0,
        estadoNombre: data.EstadoNombre ?? data.estadoNombre ?? "Desconocido"
      };
      
      console.log("Datos normalizados:", normalizado);
      
      setRefinanciamiento(normalizado);
      
      // Establecer monto pendiente como valor inicial
      if (normalizado.montoPendiente && normalizado.montoPendiente > 0) {
        setMonto(normalizado.montoPendiente.toString());
      }
    } catch (error: any) {
      console.error("Error cargando refinanciamiento:", error);
      setError(error.response?.data?.message || "Error cargando refinanciamiento");
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para calcular días restantes
  const calcularDiasRestantes = (fechaVencimiento: string | undefined | null): number => {
    if (!fechaVencimiento) return 0;
    try {
      const hoy = new Date();
      const vencimiento = new Date(fechaVencimiento);
      const diffTime = vencimiento.getTime() - hoy.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Funciones de formateo con validación
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return "RD$0.00";
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("es-DO");
    } catch {
      return "—";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinanciamiento) return;

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    const pendiente = refinanciamiento.montoPendiente || 0;
    if (montoNum > pendiente) {
      setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(pendiente)})`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      // Endpoint corregido: sin /api/ duplicado y singular
      const res = await api.post(`/refinanciamiento/${id}/pagos`, {
        monto: montoNum,
        metodoPago,
        referencia: referencia || null,
        notas: notas || null
      });

      setSuccess(res.data.mensaje || "Pago registrado exitosamente");
      
      setTimeout(() => {
        navigate(`/pagos/refinanciamientos/${id}`);
      }, 2000);

    } catch (error: any) {
      setError(error.response?.data?.message || "Error registrando pago");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando refinanciamiento...</p>
        </div>
      </div>
    );
  }

  if (!refinanciamiento) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700">{error || "Refinanciamiento no encontrado"}</p>
          <Link to="/pagos/refinanciamientos" className="text-sky-600 hover:underline mt-2 inline-block">
            Volver a Refinanciamientos
          </Link>
        </div>
      </div>
    );
  }

  // Obtener valores con fallbacks
  const numeroDocumento = refinanciamiento.documentoNumero || 
                          refinanciamiento.documento?.numeroDocumento ||
                          //refinanciamiento.documento?.NumeroDocumento ||
                          "—";
  const empresaNombre = refinanciamiento.empresa?.nombre || 
                        //refinanciamiento.empresa?.Nombre ||
                        refinanciamiento.empresaNombre || 
                        "Sin nombre";
  const montoPendiente = refinanciamiento.montoPendiente || 0;
  const diasRestantes = refinanciamiento.diasRestantes || 0;
  const fechaVencimiento = refinanciamiento.fechaVencimiento;
  
  // Verificar si la fecha es válida (no es 0001-01-01)
  const fechaEsValida = fechaVencimiento && !fechaVencimiento.startsWith("0001");
  const esVencido = fechaEsValida && diasRestantes < 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/refinanciamientos" className="text-gray-400 hover:text-gray-600">Refinanciamientos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Registrar Pago</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">🔄 Pago de Refinanciamiento</h1>
      </div>

      {/* Info del refinanciamiento */}
      <div className={`rounded-2xl p-6 ${esVencido ? "bg-red-50 border border-red-200" : "bg-purple-50 border border-purple-200"}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm ${esVencido ? "text-red-700" : "text-purple-700"}`}>Refinanciamiento</p>
            <p className={`text-xl font-bold ${esVencido ? "text-red-900" : "text-purple-900"}`}>
              {numeroDocumento}
            </p>
            <p className={esVencido ? "text-red-700" : "text-purple-700"}>{empresaNombre}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm ${esVencido ? "text-red-700" : "text-purple-700"}`}>Saldo Pendiente</p>
            <p className={`text-3xl font-bold ${esVencido ? "text-red-900" : "text-purple-900"}`}>
              {formatCurrency(montoPendiente)}
            </p>
          </div>
        </div>

        {/* Estado de vencimiento */}
        <div className={`mt-4 pt-4 border-t ${esVencido ? "border-red-200" : "border-purple-200"} flex items-center justify-between`}>
          <div>
            <p className={`text-sm ${esVencido ? "text-red-600" : "text-purple-600"}`}>Vencimiento</p>
            <p className={`font-semibold ${esVencido ? "text-red-900" : "text-purple-900"}`}>
              {fechaEsValida ? formatDate(fechaVencimiento) : "No definido"}
            </p>
          </div>
          {fechaEsValida ? (
            <div className={`px-4 py-2 rounded-lg ${esVencido ? "bg-red-100 text-red-700" : diasRestantes <= 7 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
              {esVencido 
                ? `⚠️ Vencido hace ${Math.abs(diasRestantes)} días`
                : diasRestantes === 0 
                  ? "⚠️ Vence hoy"
                  : `✅ ${diasRestantes} días restantes`
              }
            </div>
          ) : (
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600">
              Sin fecha de vencimiento
            </div>
          )}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="font-semibold text-gray-900 text-lg">Datos del Pago</h2>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Pagar *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">RD$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={montoPendiente}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-xl font-semibold"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Máximo: {formatCurrency(montoPendiente)}
          </p>
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            {METODOS_PAGO.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Referencia */}
        {metodoPago !== 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {metodoPago === 2 ? "Número de Cheque" : "Referencia/Confirmación"}
            </label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder={metodoPago === 2 ? "Ej: 001234" : "Ej: TRF-12345"}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Observaciones adicionales..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            ✅ {success}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !!success}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
          >
            {saving ? "Registrando..." : `Registrar Pago ${monto ? formatCurrency(parseFloat(monto) || 0) : ""}`}
          </button>
        </div>
      </form>
    </div>
  );
}