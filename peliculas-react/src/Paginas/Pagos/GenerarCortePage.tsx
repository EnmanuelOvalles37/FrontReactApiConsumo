// src/Paginas/Pagos/GenerarCortePage.tsx
// Página para generar un corte/factura a empresa

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cobrosApi } from "../../Servicios/pagosApi";
import api from "../../Servicios/api";

interface EmpresaOption {
  id: number;
  nombre: string;
  rnc: string;
}

export default function GenerarCortePage() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    numeroDocumento: string;
    montoTotal: number;
    cantidadConsumos: number;
  } | null>(null);

  // Form
  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [periodoDesde, setPeriodoDesde] = useState("");
  const [periodoHasta, setPeriodoHasta] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    loadEmpresas();
    // Establecer fechas por defecto (mes anterior)
    const hoy = new Date();
    const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    
    setPeriodoDesde(primerDiaMesAnterior.toISOString().split("T")[0]);
    setPeriodoHasta(ultimoDiaMesAnterior.toISOString().split("T")[0]);
  }, []);

  const loadEmpresas = async () => {
    try {
      const { data } = await api.get("/empresas", { params: { pageSize: 1000 } });
      setEmpresas(data.data || data);
    } catch (err) {
      console.error("Error cargando empresas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!empresaId) {
      setError("Seleccione una empresa");
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
      const result = await cobrosApi.generarDocumento({
        empresaId: empresaId as number,
        periodoDesde,
        periodoHasta,
        notas: notas || undefined,
      });

      setSuccess({
        numeroDocumento: result.numeroDocumento,
        montoTotal: result.montoTotal,
        cantidadConsumos: (result as { cantidadConsumos?: number }).cantidadConsumos || 0,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al generar el corte");
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
        <h1 className="text-2xl font-semibold text-gray-900">Generar Corte</h1>
        <p className="text-sm text-gray-500 mt-1">
          Genera una factura consolidando los consumos de una empresa en un período
        </p>
      </div>

      {/* Mensaje de éxito */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">✅</div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 text-lg">¡Corte generado exitosamente!</h3>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <p><strong>Documento:</strong> {success.numeroDocumento}</p>
                <p><strong>Monto Total:</strong> {formatCurrency(success.montoTotal)}</p>
                <p><strong>Consumos incluidos:</strong> {success.cantidadConsumos}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate("/pagos/cobros")}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Ver Documentos
                </button>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setEmpresaId("");
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
            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <select
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value ? parseInt(e.target.value) : "")}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              >
                <option value="">Seleccione una empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} ({emp.rnc})
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
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
              <p className="font-medium mb-1">ℹ️ Información</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Se incluirán todos los consumos no facturados del período seleccionado</li>
                <li>Los consumos reversados no se incluyen</li>
                <li>No se puede generar un corte si no hay consumos en el período</li>
              </ul>
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
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
              className="px-6 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Generando..." : "Generar Corte"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}