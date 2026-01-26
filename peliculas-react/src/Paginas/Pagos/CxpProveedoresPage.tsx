// src/Paginas/Pagos/CxP/CxpProveedoresPage.tsx
// Lista de proveedores con saldo pendiente de pago

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Servicios/api";


type ProveedorCxp = {
  proveedorId: number;
  proveedorNombre: string;
  diaCorte: number | null;
  porcentajeComision: number;
  documentosPendientes: number;
  totalBruto: number;
  totalComision: number;
  totalPorPagar: number;
  vencido: number;
};

export default function CxpProveedoresPage() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<ProveedorCxp[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cxp/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;


  const proveedoresFiltrados = proveedores.filter(p =>
  (p.proveedorNombre ?? "").toLowerCase().includes(busqueda.toLowerCase())
);

  /*const proveedoresFiltrados = proveedores.filter(p =>
    p.proveedorNombre.toLowerCase().includes(busqueda.toLowerCase())
  );*/

  const totales = {
    bruto: proveedores.reduce((sum, p) => sum + p.totalBruto, 0),
    comision: proveedores.reduce((sum, p) => sum + p.totalComision, 0),
    porPagar: proveedores.reduce((sum, p) => sum + p.totalPorPagar, 0),
    vencido: proveedores.reduce((sum, p) => sum + p.vencido, 0)
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/pagos" className="text-gray-400 hover:text-gray-600">
              💰 Pagos
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Cuentas por Pagar</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">💳 Cuentas por Pagar</h1>
          <p className="text-gray-500 mt-1">Proveedores con saldo pendiente</p>
        </div>
        <Link
          to="/pagos/cxp/generar"
          className="px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium"
        >
          + Generar Consolidado
        </Link>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto Bruto</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totales.bruto)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-green-700">Tu Comisión</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(totales.comision)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Por Pagar</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totales.porPagar)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vencido</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totales.vencido)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar proveedor..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {/* Lista de proveedores */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {proveedoresFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin pagos pendientes</h3>
            <p className="text-gray-500">No hay proveedores con saldo por pagar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Proveedor</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Comisión</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Docs</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Bruto</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Tu Ganancia</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Por Pagar</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proveedoresFiltrados.map((prov) => (
                  <tr key={prov.proveedorId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-semibold">
                          {prov.proveedorNombre?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{prov.proveedorNombre ?? "Sin nombre"}</span>

                          {prov.diaCorte && (
                            <span className="text-xs text-gray-500">Corte día {prov.diaCorte}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {prov.porcentajeComision}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        {prov.documentosPendientes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(prov.totalBruto)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {formatCurrency(prov.totalComision)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <span className="font-semibold text-gray-900 block">{formatCurrency(prov.totalPorPagar)}</span>
                        {prov.vencido > 0 && (
                          <span className="text-xs text-red-600">Vencido: {formatCurrency(prov.vencido)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/pagos/cxp/proveedores/${prov.proveedorId}`)}
                          className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => navigate(`/pagos/cxp/proveedores/${prov.proveedorId}/pagar`)}
                          className="px-3 py-1.5 text-sm bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-medium"
                        >
                          Pagar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones adicionales */}
      <div className="flex gap-4">
        <Link
          to="/pagos/cxp/historial"
          className="flex-1 p-4 bg-white rounded-xl border border-gray-200 hover:border-sky-300 transition-colors text-center"
        >
          <span className="text-2xl mb-2 block">📜</span>
          <span className="text-sm font-medium text-gray-700">Historial de Pagos</span>
        </Link>
        <Link
          to="/pagos/reportes/comisiones"
          className="flex-1 p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 bg-green-50 transition-colors text-center"
        >
          <span className="text-2xl mb-2 block">💰</span>
          <span className="text-sm font-medium text-green-700">Reporte de Comisiones</span>
        </Link>
      </div>
    </div>
  );
}