// src/Paginas/Pagos/GenerarConsolidadoCxpPage.tsx
// Página para generar consolidado de consumos a pagar a proveedor

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pagosProveedorApi } from "../../Servicios/pagosApi";
import api from "../../Servicios/api";

interface ProveedorOption {
  id: number;
  nombre: string;
  rnc: string;
}

export default function GenerarConsolidadoCxpPage() {
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState<ProveedorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    numeroDocumento: string;
    montoTotal: number;
    cantidadConsumos: number;
  } | null>(null);

  // Form
  const [proveedorId, setProveedorId] = useState<number | "">("");
  const [periodoDesde, setPeriodoDesde] = useState("");
  const [periodoHasta, setPeriodoHasta] = useState("");
  const [numeroFacturaProveedor, setNumeroFacturaProveedor] = useState("");
  const [diasParaPagar, setDiasParaPagar] = useState(30);
  const [concepto, setConcepto] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    loadProveedores();
    // Establecer fechas por defecto (mes anterior)
    const hoy = new Date();
    const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    
    setPeriodoDesde(primerDiaMesAnterior.toISOString().split("T")[0]);
    setPeriodoHasta(ultimoDiaMesAnterior.toISOString().split("T")[0]);
  }, []);

  const loadProveedores = async () => {
    try {
      const { data } = await api.get("/proveedores");
      setProveedores(data || []);
    } catch (err) {
      console.error("Error cargando proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!proveedorId) {
      setError("Seleccione un proveedor");
      return;
    }

    if (!periodoDesde || !periodoHasta) {
      setError("Seleccione el período");
      return;
    }

    if (new Date(periodoHasta) < new Date(periodoDesde)) {
      setError("La fecha 'hasta' debe ser mayor que 'desde'");
      return;
    }

    setSaving(true);
    try {
      const result = await pagosProveedorApi.generarDocumento({
        proveedorId: proveedorId as number,
        periodoDesde,
        periodoHasta,
        numeroFacturaProveedor: numeroFacturaProveedor || undefined,
        concepto: concepto || undefined,
        notas: notas || undefined,
        diasParaPagar,
      });

      setSuccess({
        numeroDocumento: result.numeroDocumento,
        montoTotal: result.montoTotal,
        cantidadConsumos: (result as { cantidadConsumos?: number }).cantidadConsumos || 0,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al generar el consolidado");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Generar Consolidado CxP</h1>
        <p className="text-sm text-gray-500 mt-1">
          Genera un documento de cuenta por pagar consolidando los consumos de un proveedor
        </p>
      </div>

      {/* Mensaje de éxito */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">✅</div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 text-lg">¡Consolidado generado exitosamente!</h3>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <p><strong>Documento:</strong> {success.numeroDocumento}</p>
                <p><strong>Monto Total:</strong> {formatCurrency(success.montoTotal)}</p>
                <p><strong>Consumos incluidos:</strong> {success.cantidadConsumos}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate("/pagos/proveedores")}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Ver Documentos
                </button>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setProveedorId("");
                    setNumeroFacturaProveedor("");
                    setConcepto("");
                    setNotas("");
                  }}
                  className="px-4 py-2 rounded-xl border border-green-600 text-green-600 hover:bg-green-50"
                >
                  Generar Otro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {!success && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor *
              </label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value ? parseInt(e.target.value) : "")}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} ({prov.rnc})
                  </option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período Desde *
                </label>
                <input
                  type="date"
                  value={periodoDesde}
                  onChange={(e) => setPeriodoDesde(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período Hasta *
                </label>
                <input
                  type="date"
                  value={periodoHasta}
                  onChange={(e) => setPeriodoHasta(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Número de factura del proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Factura del Proveedor
              </label>
              <input
                type="text"
                value={numeroFacturaProveedor}
                onChange={(e) => setNumeroFacturaProveedor(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Factura emitida por el proveedor"
              />
            </div>

            {/* Días para pagar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días para Pagar
              </label>
              <input
                type="number"
                value={diasParaPagar}
                onChange={(e) => setDiasParaPagar(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                El vencimiento será {diasParaPagar} días después de hoy
              </p>
            </div>

            {/* Info */}
            <div className="p-4 bg-green-50 rounded-xl text-sm text-green-700">
              <p className="font-medium mb-1">ℹ️ Información</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Se incluirán todos los consumos no facturados del proveedor en el período</li>
                <li>Los consumos reversados no se incluyen</li>
                <li>No se puede generar si no hay consumos en el período</li>
              </ul>
            </div>

            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concepto
              </label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Descripción del documento"
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl border hover:bg-gray-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Generando..." : "Generar Consolidado"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}