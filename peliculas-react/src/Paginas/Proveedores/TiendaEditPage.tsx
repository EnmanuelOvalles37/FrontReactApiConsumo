import { useEffect, useState, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { proveedoresApi } from "../../Servicios/proveedoresApi";

type TiendaDetail = {
  id: number;
  nombre: string;
  activo: boolean;
};

export default function TiendaEditPage(): JSX.Element {
  const { id, tiendaId } = useParams<{ id?: string; tiendaId?: string }>();
  const navigate = useNavigate();
  const proveedorId = Number(id);
  const tiendaIdNum = Number(tiendaId);

  const [tienda, setTienda] = useState<TiendaDetail | null>(null);
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!proveedorId || Number.isNaN(proveedorId) || !tiendaIdNum || Number.isNaN(tiendaIdNum)) {
        setError("IDs inválidos");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await proveedoresApi.getTienda(proveedorId, tiendaIdNum);
        if (!mounted) return;
        setTienda(data);
        setNombre(data.nombre);
        setActivo(data.activo);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("No se pudo cargar la tienda");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [proveedorId, tiendaIdNum]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await proveedoresApi.updateTienda(proveedorId, tiendaIdNum, {
        nombre: nombre.trim(),
        activo,
      });
      // Navegar de vuelta al detalle del proveedor
      navigate(`/proveedores/${proveedorId}/tiendas`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message ?? "Error guardando los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Cargando…</div>;
  if (error && !tienda) return <div className="p-6 text-red-600">{error}</div>;
  if (!tienda) return <div className="p-6">Tienda no encontrada</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Editar Tienda</h2>
        <p className="text-sm text-gray-500 mt-1">
          Modificar información de la tienda
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de la tienda
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej: Tienda Centro"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <div className="flex items-center gap-4">
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
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => navigate(`/proveedores/${proveedorId}/tiendas`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}