import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

type Caja = {
  id: number;
  nombre: string;
  activo: boolean;
};

type CajaStats = {
  cajaId: number;
  cajaNombre: string;
  cantidad: number;
  total: number;
};

type Usuario = {
  usuarioId: number;
  nombre: string;
  nivelAcceso: string;
};

type TiendaStats = {
  totalConsumos: number;
  montoTotal: number;
  porCaja: CajaStats[];
};

export default function TiendaDetailPage() {
  const { id, tiendaId } = useParams<{ id: string; tiendaId: string }>();
  const navigate = useNavigate();

  const [tiendaNombre, setTiendaNombre] = useState<string>("");
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stats, setStats] = useState<TiendaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const [cajasRes, usuariosRes, statsRes] = await Promise.all([
        api.get(`/proveedores/${id}/tiendas/${tiendaId}/cajas`),
        api.get(`/proveedores/${id}/tiendas/${tiendaId}/usuarios`),
        api.get(`/proveedores/${id}/tiendas/${tiendaId}/stats`),
      ]);

      setCajas(cajasRes.data);
      setUsuarios(usuariosRes.data);
      setStats(statsRes.data);

      const provRes = await api.get(`/proveedores/${id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tienda = provRes.data.tiendas?.find((t: any) => t.id === Number(tiendaId));
      setTiendaNombre(tienda?.nombre || "Tienda");
      
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [id, tiendaId]);

  const handleCajaCreated = (nuevaCaja: Caja) => {
    setCajas([...cajas, nuevaCaja]);
  };

  const handleCajaUpdated = (cajaActualizada: Caja) => {
    setCajas(cajas.map(c => c.id === cajaActualizada.id ? cajaActualizada : c));
  };

  const handleCajaDeleted = (cajaId: number) => {
    setCajas(cajas.filter(c => c.id !== cajaId));
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{tiendaNombre}</h2>
          <p className="text-sm text-gray-500">Detalle de tienda</p>
        </div>
        <button
          onClick={() => navigate(`/proveedores/${id}/tiendas`)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      {/* Stats Generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Total Consumos</div>
            <div className="text-3xl font-bold text-sky-600">
              {stats.totalConsumos}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Monto Total</div>
            <div className="text-3xl font-bold text-green-600">
              ${stats.montoTotal.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Cajas */}
      <div className="bg-white rounded-2xl shadow mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cajas</h3>
          <CrearCajaButton 
            proveedorId={Number(id)} 
            tiendaId={Number(tiendaId)} 
            onCreated={handleCajaCreated} 
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-right">Consumos</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cajas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                    Sin cajas registradas
                  </td>
                </tr>
              )}
              {cajas.map((caja) => {
                const cajaStats = stats?.porCaja.find((s) => s.cajaId === caja.id);
                return (
                  <tr key={caja.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{caja.nombre}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          caja.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {caja.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {cajaStats?.cantidad || 0}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      ${(cajaStats?.total || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() =>
                          navigate(`/proveedores/${id}/tiendas/${tiendaId}/cajas/${caja.id}`)
                        }
                        className="px-3 py-1.5 rounded border hover:bg-sky-50 text-sky-700 mr-2"
                      >
                        Ver consumos
                      </button>
                      <EditarCajaButton 
                        caja={caja} 
                        proveedorId={Number(id)} 
                        tiendaId={Number(tiendaId)}
                        onUpdated={handleCajaUpdated} 
                      />
                      <EliminarCajaButton 
                        caja={caja} 
                        proveedorId={Number(id)} 
                        tiendaId={Number(tiendaId)}
                        onDeleted={handleCajaDeleted} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usuarios Asignados */}
      <div className="bg-white rounded-2xl shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Usuarios con acceso</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Nivel de acceso</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                    Sin usuarios asignados
                  </td>
                </tr>
              )}
              {usuarios.map((usuario) => (
                <tr key={usuario.usuarioId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{usuario.nombre}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {usuario.nivelAcceso}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() =>
                        navigate(
                          `/proveedores/${id}/tiendas/${tiendaId}/usuarios/${usuario.usuarioId}`
                        )
                      }
                      className="px-3 py-1.5 rounded border hover:bg-sky-50 text-sky-700"
                    >
                      Ver consumos registrados
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE: Crear Caja =====
function CrearCajaButton({ 
  proveedorId, 
  tiendaId, 
  onCreated 
}: { 
  proveedorId: number; 
  tiendaId: number; 
  onCreated: (caja: Caja) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await api.post(`/proveedores/${proveedorId}/tiendas/${tiendaId}/cajas`, {
        nombre: nombre.trim(),
        activo: true
      });
      onCreated(response.data);
      setOpen(false);
      setNombre("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Error creando la caja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
      >
        Nueva Caja
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h3 className="text-lg font-semibold mb-4">Crear Nueva Caja</h3>
            
            <label className="block text-sm font-medium mb-2">Nombre de la caja</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Ej: Caja 1"
              autoFocus
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== COMPONENTE: Editar Caja =====
function EditarCajaButton({ 
  caja, 
  proveedorId, 
  tiendaId, 
  onUpdated 
}: { 
  caja: Caja; 
  proveedorId: number; 
  tiendaId: number; 
  onUpdated: (caja: Caja) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState(caja.nombre);
  const [activo, setActivo] = useState(caja.activo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await api.put(
        `/proveedores/${proveedorId}/tiendas/${tiendaId}/cajas/${caja.id}`,
        { nombre: nombre.trim(), activo }
      );
      onUpdated(response.data);
      setOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Error actualizando la caja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded border hover:bg-gray-50 mr-2"
      >
        Editar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-[420px]">
            <h3 className="text-lg font-semibold mb-4">Editar Caja</h3>
            
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <label className="block text-sm font-medium mb-2">Estado</label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={activo}
                  onChange={() => setActivo(true)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!activo}
                  onChange={() => setActivo(false)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Inactivo</span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== COMPONENTE: Eliminar Caja =====
function EliminarCajaButton({ 
  caja, 
  proveedorId, 
  tiendaId, 
  onDeleted 
}: { 
  caja: Caja; 
  proveedorId: number; 
  tiendaId: number; 
  onDeleted: (cajaId: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la caja "${caja.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/proveedores/${proveedorId}/tiendas/${tiendaId}/cajas/${caja.id}`);
      onDeleted(caja.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "Error eliminando la caja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 rounded border text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}