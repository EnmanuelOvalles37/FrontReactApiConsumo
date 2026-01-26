

  // src/Paginas/Empresas/EmpresaDetail.tsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchEmpresaDetail, type EmpresaDetailDto } from "../../assets/api/empresa";


// Modales
import EmpresaModal from "./EmpresaModal";
import { clientesApi } from "../../assets/api/ClientesApi";
import ClienteModal from "../../Componentes/Clientes/ClienteModal";
import ClientesBulkModal from "../../Componentes/Clientes/ClientesBulkModal";
import api from "../../Servicios/api";

type ClienteRow = {
  id: number;
  codigo: string;
  nombre: string;
  cedula?: string;
  grupo: string;
  saldo: number;
  saldoOriginal: number;
  activo: boolean;
  diaCorte: number;
};

type CreditoInfo = {
  limiteEmpresa: number;
  limiteAsignadoEmpleados: number;
  disponibleParaAsignar: number;
  porcentajeUtilizado: number;
  totalEmpleados: number;
  empleadosActivos: number;
};

// Extender el tipo para incluir diaCorte
interface EmpresaDetailExtended extends EmpresaDetailDto {
  diaCorte?: number;
}

export default function EmpresaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const empresaId = useMemo(() => Number(id), [id]);

  const [empresa, setEmpresa] = useState<EmpresaDetailExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pestañas - agregamos "config"
  const [tab, setTab] = useState<"datos" | "clientes" | "bulk" | "config">("datos");

  // Estado de clientes
  const [cliLoading, setCliLoading] = useState(false);
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // Información de crédito
  const [creditoInfo, setCreditoInfo] = useState<CreditoInfo | null>(null);
  const [creditoLoading, setCreditoLoading] = useState(false);

  // Estado para configuración de día de corte
  const [diaCorteEdit, setDiaCorteEdit] = useState<number>(15);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modales
  const [openEmpresaModal, setOpenEmpresaModal] = useState(false);
  const [openClienteModal, setOpenClienteModal] = useState(false);
  const [openBulkModal, setOpenBulkModal] = useState(false);

  const [clienteMode, setClienteMode] = useState<"create" | "edit">("create");
  const [clienteActual, setClienteActual] = useState<ClienteRow | null>(null);

  // Carga de empresa
  useEffect(() => {
    if (!Number.isFinite(empresaId) || empresaId <= 0) {
      setError("Id de empresa inválido.");
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const emp = await fetchEmpresaDetail(empresaId);
        if (alive) {
          setEmpresa(emp);
          setDiaCorteEdit(emp.diaCorte ?? 15);
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!alive) return;
        if (e?.response?.status === 404) setError("Empresa no encontrada.");
        else setError("No se pudo cargar la empresa.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [empresaId]);

  // Carga de clientes y crédito
  useEffect(() => {
    if (tab !== "clientes" || !empresaId) return;
    let alive = true;

    (async () => {
      try {
        setCliLoading(true);
        setCreditoLoading(true);

        const [clientesRes, creditoRes] = await Promise.all([
          clientesApi.list(empresaId),
          api.get(`/empresas/${empresaId}/credito-disponible`)
        ]);

        if (alive) {
          setClientes(clientesRes.data);
          setCreditoInfo(creditoRes.data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        if (alive) {
          setCliLoading(false);
          setCreditoLoading(false);
        }
      }
    })();

    return () => { alive = false; };
  }, [tab, empresaId]);

  const refreshEmpresa = async () => {
    if (!empresaId) return;
    const emp = await fetchEmpresaDetail(empresaId);
    setEmpresa(emp);
    setDiaCorteEdit(emp.diaCorte ?? 15);
  };

  const refreshClientes = async () => {
    if (!empresaId) return;
    const [clientesRes, creditoRes] = await Promise.all([
      clientesApi.list(empresaId),
      api.get(`/empresas/${empresaId}/credito-disponible`)
    ]);
    setClientes(clientesRes.data);
    setCreditoInfo(creditoRes.data);
  };

  // Guardar configuración de día de corte
  const handleSaveDiaCorte = async () => {
    if (!empresaId) return;
    
    try {
      setSavingConfig(true);
      setConfigMessage(null);
      
      await api.put(`/empresas/${empresaId}/dia-corte`, {
        diaCorte: diaCorteEdit
      });
      
      await refreshEmpresa();
      setConfigMessage({ type: "success", text: "Día de corte actualizado correctamente" });
      
      setTimeout(() => setConfigMessage(null), 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setConfigMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Error al actualizar el día de corte" 
      });
    } finally {
      setSavingConfig(false);
    }
  };

  // Calcular próxima fecha de corte
  const calcularProximoCorte = (diaCorte: number): Date => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();
    
    let fechaCorte = new Date(año, mes, diaCorte);
    
    // Si ya pasó el día de corte este mes, usar el próximo mes
    if (hoy.getDate() > diaCorte) {
      fechaCorte = new Date(año, mes + 1, diaCorte);
    }
    
    return fechaCorte;
  };

  // Calcular días restantes para el corte
  const calcularDiasParaCorte = (diaCorte: number): number => {
    const hoy = new Date();
    const proximoCorte = calcularProximoCorte(diaCorte);
    const diffTime = proximoCorte.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.cedula?.includes(busquedaCliente) ||
    c.codigo.toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO")}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-DO", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando empresa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/empresas")}
            className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Volver a Empresas
          </button>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">Sin datos de empresa.</p>
        </div>
      </div>
    );
  }

  const diaCorteActual = empresa.diaCorte ?? 15;
  const proximoCorte = calcularProximoCorte(diaCorteActual);
  const diasParaCorte = calcularDiasParaCorte(diaCorteActual);

  

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${
              empresa.activo ? "bg-sky-500" : "bg-gray-400"
            }`}>
              {empresa.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{empresa.nombre}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  empresa.activo
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {empresa.activo ? "Activa" : "Inactiva"}
                </span>
              </div>
              <p className="text-gray-500 mt-1">
                RNC: <span className="font-mono">{empresa.rnc || "—"}</span>
                <span className="mx-2">•</span>
                <span className="text-sky-600">Corte: día {diaCorteActual}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/empresas")}
              className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Volver
            </button>
            <button
              onClick={() => setOpenEmpresaModal(true)}
              className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors"
            >
              ✏️ Editar
            </button>
          </div>
        </div>

        {/* Indicador de próximo corte */}
        <div className={`mt-4 p-3 rounded-xl flex items-center justify-between ${
          diasParaCorte <= 3 
            ? "bg-red-50 border border-red-200" 
            : diasParaCorte <= 7 
              ? "bg-amber-50 border border-amber-200"
              : "bg-sky-50 border border-sky-200"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className={`text-sm font-medium ${
                diasParaCorte <= 3 ? "text-red-700" : diasParaCorte <= 7 ? "text-amber-700" : "text-sky-700"
              }`}>
                Próximo corte: {formatDate(proximoCorte)}
              </p>
              <p className={`text-xs ${
                diasParaCorte <= 3 ? "text-red-600" : diasParaCorte <= 7 ? "text-amber-600" : "text-sky-600"
              }`}>
                {diasParaCorte === 0 
                  ? "¡El corte es hoy!" 
                  : diasParaCorte === 1 
                    ? "Falta 1 día" 
                    : `Faltan ${diasParaCorte} días`
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setTab("config")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              diasParaCorte <= 3 
                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                : diasParaCorte <= 7 
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-sky-100 text-sky-700 hover:bg-sky-200"
            }`}
          >
            Configurar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab("datos")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              tab === "datos"
                ? "text-sky-600 bg-sky-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            📋 Información General
            {tab === "datos" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></span>
            )}
          </button>
          <button
            onClick={() => setTab("clientes")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              tab === "clientes"
                ? "text-sky-600 bg-sky-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            👥 Empleados
            {tab === "clientes" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></span>
            )}
          </button>
          <button
            onClick={() => setTab("config")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              tab === "config"
                ? "text-sky-600 bg-sky-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            ⚙️ Configuración
            {tab === "config" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></span>
            )}
          </button>
          <button
            onClick={() => setTab("bulk")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              tab === "bulk"
                ? "text-sky-600 bg-sky-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            📤 Carga Masiva
            {tab === "bulk" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* TAB: Datos */}
          {tab === "datos" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoCard icon="📞" label="Teléfono" value={empresa.telefono || "—"} />
              <InfoCard icon="📧" label="Email" value={empresa.email || "—"} />
              <InfoCard
                icon="📅"
                label="Fecha de Registro"
                value={empresa.creadoEn ? new Date(empresa.creadoEn).toLocaleDateString("es-DO") : "—"}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <InfoCard icon="📍" label="Dirección" value={empresa.direccion || "—"} />
              </div>
              <InfoCard
                icon="💳"
                label="Límite de Crédito"
                value={formatCurrency(empresa.limiteCredito ?? 0)}
                highlight
              />
              <InfoCard
                icon="📆"
                label="Día de Corte"
                value={`Día ${diaCorteActual} de cada mes`}
                highlight
              />
              <InfoCard
                icon="⏰"
                label="Próximo Corte"
                value={proximoCorte.toLocaleDateString("es-DO")}
                highlight={diasParaCorte <= 7}
              />
            </div>
          )}

          {/* TAB: Configuración */}
          {tab === "config" && (
            <div className="max-w-2xl space-y-6">
              {/* Día de Corte */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  📅 Día de Corte Mensual
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  El día de corte determina cuándo se generará automáticamente el documento de cuenta por cobrar 
                  para todos los empleados de esta empresa. Todos los consumos realizados desde el último corte 
                  hasta esta fecha serán incluidos en el documento.
                </p>

                <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Día del mes para generar el corte
                    </label>
                    <div className="flex items-center gap-4">
                      <select
                        value={diaCorteEdit}
                        onChange={(e) => setDiaCorteEdit(Number(e.target.value))}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
                          <option key={dia} value={dia}>
                            Día {dia}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-500 text-sm">de cada mes</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Se recomienda usar días entre 1 y 28 para evitar problemas con meses cortos.
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
                    <p className="text-sm font-medium text-sky-800 mb-2">Vista previa:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-sky-600">Próximo corte con esta configuración:</p>
                        <p className="font-semibold text-sky-900">
                          {formatDate(calcularProximoCorte(diaCorteEdit))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sky-600">Días restantes:</p>
                        <p className="font-semibold text-sky-900">
                          {calcularDiasParaCorte(diaCorteEdit)} días
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje */}
                  {configMessage && (
                    <div className={`p-3 rounded-xl ${
                      configMessage.type === "success" 
                        ? "bg-green-50 border border-green-200 text-green-700" 
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}>
                      {configMessage.type === "success" ? "✅" : "❌"} {configMessage.text}
                    </div>
                  )}

                  {/* Botón guardar */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setDiaCorteEdit(empresa.diaCorte ?? 15)}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      disabled={savingConfig}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveDiaCorte}
                      disabled={savingConfig || diaCorteEdit === diaCorteActual}
                      className="px-6 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {savingConfig ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info adicional */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-amber-800">¿Cómo funciona el corte?</p>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                      <li>El día de corte aplica a <strong>todos los empleados</strong> de esta empresa</li>
                      <li>Los consumos se agrupan desde el día después del último corte hasta el día de corte</li>
                      <li>Se genera automáticamente un documento CxC con el total a cobrar</li>
                      <li>El documento tiene un período de vencimiento configurable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Empleados */}
          {tab === "clientes" && (
            <div className="space-y-6">
              {/* Resumen de crédito */}
              {creditoLoading ? (
                <div className="bg-gray-50 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              ) : creditoInfo && creditoInfo.limiteEmpresa > 0 ? (
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-6 border border-sky-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sky-900">Resumen de Crédito</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      creditoInfo.porcentajeUtilizado >= 90
                        ? "bg-red-100 text-red-700"
                        : creditoInfo.porcentajeUtilizado >= 70
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                    }`}>
                      {creditoInfo.porcentajeUtilizado}% asignado
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-white rounded-full h-3 mb-4 shadow-inner">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        creditoInfo.porcentajeUtilizado >= 90
                          ? "bg-red-500"
                          : creditoInfo.porcentajeUtilizado >= 70
                            ? "bg-amber-500"
                            : "bg-sky-500"
                      }`}
                      style={{ width: `${Math.min(creditoInfo.porcentajeUtilizado, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Límite Empresa</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(creditoInfo.limiteEmpresa)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Asignado</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(creditoInfo.limiteAsignadoEmpleados)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Disponible</p>
                      <p className={`text-lg font-bold ${
                        creditoInfo.disponibleParaAsignar <= 0 ? "text-red-600" : "text-green-600"
                      }`}>
                        {formatCurrency(creditoInfo.disponibleParaAsignar)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Empleados</p>
                      <p className="text-lg font-bold text-sky-600">
                        {creditoInfo.empleadosActivos} / {creditoInfo.totalEmpleados}
                      </p>
                    </div>
                  </div>

                  {creditoInfo.disponibleParaAsignar <= 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-700">
                        ⚠️ No hay crédito disponible para asignar a nuevos empleados.
                      </p>
                    </div>
                  )}
                </div>
              ) : creditoInfo && creditoInfo.limiteEmpresa === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ Esta empresa no tiene límite de crédito configurado.
                  </p>
                </div>
              ) : null}

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative max-w-md">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    setClienteMode("create");
                    setClienteActual(null);
                    setOpenClienteModal(true);
                  }}
                  disabled={creditoInfo?.disponibleParaAsignar === 0 && (creditoInfo?.limiteEmpresa ?? 0) > 0}
                  className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  + Nuevo Empleado
                </button>
              </div>

              {/* Lista de empleados */}
              {cliLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Cargando empleados...</p>
                </div>
              ) : clientesFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {clientes.length === 0 ? "No hay empleados" : "Sin resultados"}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {clientes.length === 0
                      ? "Crea el primer empleado de esta empresa"
                      : "Intenta con otros términos de búsqueda"
                    }
                  </p>
                  {clientes.length === 0 && (
                    <button
                      onClick={() => {
                        setClienteMode("create");
                        setClienteActual(null);
                        setOpenClienteModal(true);
                      }}
                      className="text-sky-600 hover:underline font-medium"
                    >
                      + Crear primer empleado
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Empleado</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Cédula</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-600">Límite</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-600">Disponible</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-600">Utilizado</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {clientesFiltrados.map((c) => {
                        const utilizado = c.saldoOriginal - c.saldo;
                        const porcentaje = c.saldoOriginal > 0
                          ? Math.round((utilizado / c.saldoOriginal) * 100)
                          : 0;

                        return (
                          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                                  c.activo ? "bg-purple-500" : "bg-gray-400"
                                }`}>
                                  {c.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{c.nombre}</p>
                                  {/*<p className="text-xs text-gray-400 font-mono">{c.codigo}</p>*/} 
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                              {c.cedula || "—"}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency(c.saldoOriginal)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={c.saldo <= 0 ? "text-red-600 font-semibold" : "text-green-600 font-medium"}>
                                {formatCurrency(c.saldo)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-gray-600">{formatCurrency(utilizado)}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  porcentaje >= 90
                                    ? "bg-red-100 text-red-700"
                                    : porcentaje >= 70
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-gray-100 text-gray-600"
                                }`}>
                                  {porcentaje}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                c.activo
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.activo ? "bg-green-500" : "bg-gray-400"}`}></span>
                                {c.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setClienteMode("edit");
                                    setClienteActual(c);
                                    setOpenClienteModal(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={async () => {
                                    await clientesApi.toggle(empresaId, c.id);
                                    await refreshClientes();
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    c.activo
                                      ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                      : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                                  }`}
                                  title={c.activo ? "Desactivar" : "Activar"}
                                >
                                  {c.activo ? "🚫" : "✅"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: Carga Masiva */}
          {tab === "bulk" && (
            <div className="max-w-2xl">
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">📤 Importar Empleados desde CSV</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Sube un archivo CSV con las siguientes columnas:
                </p>
                <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                  <code className="text-sm text-gray-700 font-mono">
                    codigo, nombre, cedula, grupo, saldoOriginal, activo
                  </code>
                  <p className="text-xs text-gray-500 mt-2">
                    Nota: El día de corte ya no es necesario por empleado, se usa el de la empresa (día {diaCorteActual}).
                  </p>
                </div>

                {creditoInfo && creditoInfo.limiteEmpresa > 0 && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-sky-800">
                      ℹ️ Crédito disponible para asignar:{" "}
                      <strong>{formatCurrency(creditoInfo.disponibleParaAsignar)}</strong>
                    </p>
                    <p className="text-xs text-sky-600 mt-1">
                      La suma de los límites en el archivo no debe exceder este monto.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setOpenBulkModal(true)}
                  className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
                >
                  📁 Seleccionar Archivo CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      <EmpresaModal
        open={openEmpresaModal}
        mode="edit"
        empresa={{
          id: empresa.id,
          nombre: empresa.nombre,
          rnc: empresa.rnc ?? "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          limite_Credito: (empresa as any).limiteCredito ?? (empresa as any).limite_Credito ?? 0,
          activo: empresa.activo ?? true
        }}
        onClose={() => setOpenEmpresaModal(false)}
        onSaved={async () => {
          await refreshEmpresa();
          if (tab === "clientes") {
            await refreshClientes();
          }
        }}
      />

      <ClienteModal
        open={openClienteModal}
        mode={clienteMode}
        empresaId={empresaId}
        cliente={clienteActual}
        onClose={() => setOpenClienteModal(false)}
        onSaved={async () => {
          await refreshClientes();
          await refreshEmpresa();
        }}
      />

      <ClientesBulkModal
        open={openBulkModal}
        empresaId={empresaId}
        onClose={() => setOpenBulkModal(false)}
        onDone={async () => {
          await refreshClientes();
          await refreshEmpresa();
        }}
      />
    </div>
  );
}

// Componente auxiliar para mostrar información
function InfoCard({
  icon,
  label,
  value,
  highlight = false
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? "bg-sky-50 border-sky-200" : "bg-gray-50 border-gray-100"}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`font-medium ${highlight ? "text-sky-700" : "text-gray-900"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}