 // src/Paginas/Empleador/HistorialPagosPage.tsx
// Historial de pagos realizados - Vista Empleador

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Servicios/api";

interface Pago {
  id: number;
  numeroRecibo: string;
  fecha: string;
  numeroDocumento: string;
  monto: number;
  metodoPago: number;
  referencia: string | null;
  banco: string | null;
}

export default function HistorialPagosPage() {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/empleador/historial-pagos");
      setPagos(res.data || []);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) =>
    `RD$${(value ?? 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });

  const getMetodoPago = (metodo: number) => {
    const metodos: Record<number, { nombre: string; icono: string }> = {
      0: { nombre: "Efectivo", icono: "💵" },
      1: { nombre: "Transferencia", icono: "🏦" },
      2: { nombre: "Tarjeta", icono: "💳" },
      3: { nombre: "Cheque", icono: "📝" },
    };
    return metodos[metodo] || { nombre: "Otro", icono: "💰" };
  };

  const totales = {
    cantidad: pagos.length,
    monto: pagos.reduce((sum, p) => sum + (p.monto ?? 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-sky-600 to-sky-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard-empleador")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-xl font-bold">Historial de Pagos</h1>
              <p className="text-sky-100 text-sm">Pagos realizados a tu empresa</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Resumen */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pagos</p>
                <p className="text-xl font-bold text-gray-900">{totales.cantidad}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monto Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totales.monto)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pagos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : pagos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sin pagos registrados</h3>
              <p>No hay pagos en el historial</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Recibo</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Documento</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Método</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Referencia</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pagos.map((pago) => {
                    const metodo = getMetodoPago(pago.metodoPago);
                    return (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">
                          {formatDateTime(pago.fecha)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-gray-900">{pago.numeroRecibo}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sky-600 font-medium">{pago.numeroDocumento}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                            <span>{metodo.icono}</span>
                            {metodo.nombre}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {pago.referencia || pago.banco || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-green-600">{formatCurrency(pago.monto)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-600">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      {formatCurrency(totales.monto)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}