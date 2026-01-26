// src/Paginas/Proveedores/ProveedorDetailPage.tsx
// Detalle de proveedor - Diseño mejorado con pestañas
// Pestañas: Información General, Tiendas, Usuarios/Cajeros

import { useEffect, useState, type JSX } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { proveedoresApi } from "../../Servicios/proveedoresApi";
import ProveedorUsuariosTab from "./ProveedorUsuariosTab";

type ProveedorTienda = {
  id: number;
  nombre: string;
  activo: boolean;
};

// Tipo con campos opcionales para compatibilidad
type ProveedorDetail = {
  id: number;
  nombre: string;
  rnc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  diasCorte?: number | null;
  porcentajeComision?: number;
  activo: boolean;
  creadoUtc?: string;
  tiendas: ProveedorTienda[];
};

type Tab = "info" | "tiendas" | "usuarios";

export default function ProveedorDetailPage(): JSX.Element {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const proveedorId = Number(id);

  const [prov, setProv] = useState<ProveedorDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  // Modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!proveedorId || Number.isNaN(proveedorId)) {
        setErr("ID de proveedor inválido");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await proveedoresApi.getDetail(proveedorId);
        if (!mounted) return;
        // Mapear los datos asegurando valores por defecto
        setProv({
          ...data,
          porcentajeComision: data.porcentajeComision ?? 0,
          diasCorte: data.diasCorte ?? null,
          direccion: data.direccion ?? '',
          telefono: data.telefono ?? '',
          email: data.email ?? '',
          contacto: data.contacto ?? '',
        });
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setErr("No se pudo cargar el proveedor");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [proveedorId]);

  const refreshProveedor = async () => {
    try {
      const data = await proveedoresApi.getDetail(proveedorId);
      setProv({
        ...data,
        porcentajeComision: data.porcentajeComision ?? 0,
        diasCorte: data.diasCorte ?? null,
        direccion: data.direccion ?? '',
        telefono: data.telefono ?? '',
        email: data.email ?? '',
        contacto: data.contacto ?? '',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTiendaCreated = (t: ProveedorTienda) => {
    setProv((p) => (p ? { ...p, tiendas: [...p.tiendas, t] } : p));
  };

  const handleTiendaDeleted = (tiendaId: number) => {
    setProv((p) => (p ? { ...p, tiendas: p.tiendas.filter((t) => t.id !== tiendaId) } : p));
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando proveedor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (err) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{err}</p>
          <button
            onClick={() => navigate("/proveedores")}
            className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Volver a Proveedores
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!prov) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-gray-500">Proveedor no encontrado</p>
        </div>
      </div>
    );
  }

  // Estadísticas
  const tiendasActivas = prov.tiendas.filter(t => t.activo).length;
  const tiendasInactivas = prov.tiendas.filter(t => !t.activo).length;
  const comision = prov.porcentajeComision ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${
              prov.activo ? "bg-sky-500" : "bg-gray-400"
            }`}>
              {prov.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{prov.nombre}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  prov.activo
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {prov.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              {prov.rnc && (
                <p className="text-gray-500 mt-1">
                  RNC: <span className="font-mono">{prov.rnc}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/proveedores")}
              className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Volver
            </button>
            {activeTab === "info" && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
              >
                ✏️ Editar
              </button>
            )}
            {activeTab === "tiendas" && (
              <AddTiendaButton proveedorId={prov.id} onCreated={handleTiendaCreated} />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === "info"
                ? "text-sky-600 bg-sky-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              📋 Información General
            </span>
            {activeTab === "info" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("tiendas")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === "tiendas"
                ? "text-sky-600 bg-sky-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              🏪 Tiendas
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "tiendas" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"
              }`}>
                {prov.tiendas.length}
              </span>
            </span>
            {activeTab === "tiendas" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === "usuarios"
                ? "text-sky-600 bg-sky-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              👥 Usuarios / Cajeros
            </span>
            {activeTab === "usuarios" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"></span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* TAB: Información General */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Tarjetas de resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoCard
                  icon="💰"
                  label="Comisión"
                  value={`${comision}%`}
                  highlight={comision > 0}
                />
                <InfoCard
                  icon="📅"
                  label="Día de Corte"
                  value={prov.diasCorte ? `Día ${prov.diasCorte}` : "No configurado"}
                />
                <InfoCard
                  icon="🏪"
                  label="Tiendas"
                  value={`${tiendasActivas} activas`}
                />
                <InfoCard
                  icon="📊"
                  label="Estado"
                  value={prov.activo ? "Operativo" : "Inactivo"}
                  highlight={prov.activo}
                />
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Datos de contacto */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">📇</span>
                    Datos de Contacto
                  </h3>
                  <div className="space-y-4">
                    <InfoRow label="Teléfono" value={prov.telefono} icon="📞" />
                    <InfoRow label="Email" value={prov.email} icon="✉️" />
                    <InfoRow label="Persona de Contacto" value={prov.contacto} icon="👤" />
                    <InfoRow label="Dirección" value={prov.direccion} icon="📍" />
                  </div>
                </div>

                {/* Configuración de pagos */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">⚙️</span>
                    Configuración de Pagos
                  </h3>
                  <div className="space-y-4">
                    <InfoRow 
                      label="Porcentaje de Comisión" 
                      value={`${comision}%`} 
                      icon="💰"
                      highlight
                    />
                    <InfoRow 
                      label="Día de Corte" 
                      value={prov.diasCorte ? `Día ${prov.diasCorte} de cada mes` : undefined} 
                      icon="📅" 
                    />
                    <InfoRow 
                      label="RNC" 
                      value={prov.rnc} 
                      icon="🆔" 
                    />
                  </div>

                  {/* Ejemplo de cálculo */}
                  {comision > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800 font-medium mb-2">
                        💡 Ejemplo de cálculo con {comision}% de comisión:
                      </p>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>• Consumo de RD$1,000.00</p>
                        <p>• Tu comisión: <strong>RD${(1000 * comision / 100).toFixed(2)}</strong></p>
                        <p>• Pago al proveedor: <strong>RD${(1000 - (1000 * comision / 100)).toFixed(2)}</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">ID del Proveedor</p>
                    <p className="font-mono text-gray-900">{prov.id}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Fecha de Registro</p>
                    <p className="text-gray-900">
                      {prov.creadoUtc 
                        ? new Date(prov.creadoUtc).toLocaleDateString('es-DO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'No disponible'
                      }
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Tiendas Registradas</p>
                    <p className="text-gray-900">
                      {prov.tiendas.length} ({tiendasActivas} activas, {tiendasInactivas} inactivas)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Tiendas */}
          {activeTab === "tiendas" && (
            <div className="space-y-6">
              {/* Estadísticas de tiendas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🏪</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{prov.tiendas.length}</p>
                      <p className="text-xs text-gray-500">Total Tiendas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">✅</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-600">{tiendasActivas}</p>
                      <p className="text-xs text-gray-500">Activas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-xl">⏸️</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-500">{tiendasInactivas}</p>
                      <p className="text-xs text-gray-500">Inactivas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de tiendas */}
              {prov.tiendas.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay tiendas</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Crea la primera tienda para este proveedor
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prov.tiendas.map((t) => (
                    <div
                      key={t.id}
                      className={`bg-white border rounded-2xl p-4 transition-all hover:shadow-md ${
                        t.activo ? "border-gray-200" : "border-gray-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold ${
                            t.activo ? "bg-emerald-500" : "bg-gray-400"
                          }`}>
                            {t.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{t.nombre}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                              t.activo
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${t.activo ? "bg-green-500" : "bg-gray-400"}`}></span>
                              {t.activo ? "Activa" : "Inactiva"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Link
                          to={`/proveedores/${prov.id}/tiendas/${t.id}`}
                          className="px-3 py-1.5 text-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                        >
                          Ver detalles
                        </Link>
                        <button
                          onClick={() => navigate(`/proveedores/${prov.id}/tiendas/${t.id}/editar`)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <DeleteTiendaButton
                          proveedorId={prov.id}
                          tienda={t}
                          onDeleted={handleTiendaDeleted}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Usuarios */}
          {activeTab === "usuarios" && <ProveedorUsuariosTab proveedorId={prov.id} />}
        </div>
      </div>

      {/* Modal de Edición */}
      {editModalOpen && prov && (
        <EditProveedorModal
          proveedor={prov}
          onClose={() => setEditModalOpen(false)}
          onSaved={async () => {
            await refreshProveedor();
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

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

function InfoRow({
  icon,
  label,
  value,
  highlight = false
}: {
  icon: string;
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-medium ${
          value 
            ? (highlight ? "text-sky-700" : "text-gray-900")
            : "text-gray-400 italic"
        }`}>
          {value || "No especificado"}
        </p>
      </div>
    </div>
  );
}

// Modal de edición de proveedor
function EditProveedorModal({
  proveedor,
  onClose,
  onSaved
}: {
  proveedor: ProveedorDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    nombre: proveedor.nombre,
    rnc: proveedor.rnc || '',
    direccion: proveedor.direccion || '',
    telefono: proveedor.telefono || '',
    email: proveedor.email || '',
    contacto: proveedor.contacto || '',
    diasCorte: proveedor.diasCorte?.toString() || '',
    porcentajeComision: proveedor.porcentajeComision?.toString() || '0',
    activo: proveedor.activo
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Datos enviados:", formData);
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await proveedoresApi.update(proveedor.id, {
        nombre: formData.nombre,
        rnc: formData.rnc || null,
        direccion: formData.direccion || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        contacto: formData.contacto || null,
        diasCorte: Number.isNaN(parseInt(formData.diasCorte))
        ? 15
        : parseInt(formData.diasCorte, 10),

        porcentajeComision: Number.isNaN(parseFloat(formData.porcentajeComision))
        ? 0
        : parseFloat(formData.porcentajeComision),
        activo: formData.activo
      });
      onSaved();
    } catch (e: unknown) {
      console.error(e);
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  

  

  const comisionNum = Number(formData.porcentajeComision) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">✏️ Editar Proveedor</h3>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Información General</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RNC
                </label>
                <input
                  type="text"
                  name="rnc"
                  value={formData.rnc}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="000-00000-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="809-000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="contacto@proveedor.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Configuración de pagos */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Configuración de Pagos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de Corte
                </label>
                <input
                  type="number"
                  name="diasCorte"
                  value={formData.diasCorte}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Día del mes (1-31)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión (%)
                </label>
                <input
                  type="number"
                  name="porcentajeComision"
                  value={formData.porcentajeComision}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {comisionNum > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800 font-medium">
                  💡 Ejemplo con {comisionNum}% de comisión:
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Consumo RD$1,000 → Tu comisión: RD${(1000 * comisionNum / 100).toFixed(2)} → Pago al proveedor: RD${(1000 - (1000 * comisionNum / 100)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Proveedor activo
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para agregar tienda
function AddTiendaButton({
  proveedorId,
  onCreated,
}: {
  proveedorId: number;
  onCreated: (t: ProveedorTienda) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const r = await proveedoresApi.createTienda(proveedorId, { nombre: nombre.trim() }) as ProveedorTienda;
      onCreated(r);
      setOpen(false);
      setNombre("");
    } catch (e: unknown) {
      console.error(e);
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? "Error creando la tienda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
      >
        + Nueva Tienda
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">🏪 Nueva Tienda</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la tienda
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Ej: Sucursal Centro"
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpen(false);
                  setNombre("");
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="px-5 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? "Guardando..." : "Crear Tienda"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Botón para eliminar tienda
function DeleteTiendaButton({
  proveedorId,
  tienda,
  onDeleted,
}: {
  proveedorId: number;
  tienda: ProveedorTienda;
  onDeleted: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la tienda "${tienda.nombre}"?\n\nEsta acción no podrá deshacerse.`))
      return;
    setLoading(true);
    try {
      await proveedoresApi.deleteTienda(proveedorId, tienda.id);
      onDeleted(tienda.id);
    } catch (e) {
      console.error(e);
      alert("Error eliminando la tienda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar"
    >
      {loading ? "..." : "🗑️"}
    </button>
  );
}