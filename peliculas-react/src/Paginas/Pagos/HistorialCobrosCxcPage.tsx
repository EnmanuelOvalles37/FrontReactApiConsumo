/*
/* eslint-disable @typescript-eslint/no-explicit-any /
// src/Paginas/Pagos/CxC/HistorialCobrosCxcPage.tsx
// Historial de cobros CxC

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";


type Cobro = {
  id: number;
  numeroComprobante: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre: string;
  referencia: string | null;
  documentoId: number;
  documentoNumero: string;
  empresaNombre: string;
  registradoPor: string;
};

type Empresa = {
  id: number;
  nombre: string;
};

export default function HistorialCobrosCxcPage() {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMonto, setTotalMonto] = useState(0);
  
  // Filtros
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEmpresas();
    // Fechas por defecto: último mes
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setHasta(hoy.toISOString().split('T')[0]);
    setDesde(inicioMes.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (desde && hasta) loadCobros();
  }, [empresaId, desde, hasta, page]);

  const loadEmpresas = async () => {
    try {
      const res = await api.get("/empresas");
      setEmpresas(res.data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    }
  };

  const loadCobros = async () => {
    try {
      setLoading(true);
      const params: any = { desde, hasta, page, pageSize: 20 };
      if (empresaId) params.empresaId = empresaId;

      const res = await api.get("/cxc/cobros", { params });
      setCobros(res.data.data);
      setTotalMonto(res.data.totalMonto);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error("Error cargando cobros:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDateTime = (date: string) => new Date(date).toLocaleString("es-DO");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header /}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/cxc" className="text-gray-400 hover:text-gray-600">CxC</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Historial de Cobros</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">📜 Historial de Cobros</h1>
        <p className="text-gray-500 mt-1">Registro de todos los cobros recibidos de empresas</p>
      </div>

      {/* Filtros /}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
            <select
              value={empresaId || ""}
              onChange={(e) => { setEmpresaId(e.target.value ? Number(e.target.value) : null); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas las empresas</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => { setDesde(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => { setHasta(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setEmpresaId(null); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Total /}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <span className="text-green-700 font-medium">Total cobrado en período:</span>
        <span className="text-2xl font-bold text-green-700">{formatCurrency(totalMonto)}</span>
      </div>

      {/* Lista /}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando cobros...</p>
          </div>
        ) : cobros.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin cobros</h3>
            <p className="text-gray-500">No hay cobros en el período seleccionado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Comprobante</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Empresa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Documento</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Método</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Monto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cobros.map((cobro) => (
                    <tr key={cobro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{cobro.numeroComprobante}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(cobro.fecha)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{cobro.empresaNombre}</td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/pagos/cxc/documentos/${cobro.documentoId}`}
                          className="text-sm text-sky-600 hover:underline"
                        >
                          {cobro.documentoNumero}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cobro.metodoPagoNombre}
                        {cobro.referencia && (
                          <span className="block text-xs text-gray-400">{cobro.referencia}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {formatCurrency(cobro.monto)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{cobro.registradoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación /}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} */

  /* eslint-disable @typescript-eslint/no-explicit-any */
// src/Paginas/Pagos/CxC/HistorialCobrosCxcPage.tsx
// Historial de cobros CxC

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Servicios/api";


type Cobro = {
  id: number;
  numeroComprobante: string;
  fecha: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre: string;
  referencia: string | null;
  documentoId: number;
  documentoNumero: string;
  empresaNombre: string;
  registradoPor: string;
};

type Empresa = {
  id: number;
  nombre: string;
};

export default function HistorialCobrosCxcPage() {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMonto, setTotalMonto] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEmpresas();
    // Fechas por defecto: último mes
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setHasta(hoy.toISOString().split('T')[0]);
    setDesde(inicioMes.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (desde && hasta) loadCobros();
  }, [empresaId, desde, hasta, page]);

  const loadEmpresas = async () => {
    try {
      const res = await api.get("/empresas");
      // Manejar diferentes formatos de respuesta
      const data = res.data;
      if (Array.isArray(data)) {
        setEmpresas(data);
      } else if (data.empresas && Array.isArray(data.empresas)) {
        setEmpresas(data.empresas);
      } else if (data.data && Array.isArray(data.data)) {
        setEmpresas(data.data);
      } else {
        console.warn("Formato de empresas no reconocido:", data);
        setEmpresas([]);
      }
    } catch (error) {
      console.error("Error cargando empresas:", error);
      setEmpresas([]);
    }
  };

  const loadCobros = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { desde, hasta, page, pageSize: 20 };
      if (empresaId) params.empresaId = empresaId;

      const res = await api.get("/cxc/cobros", { params });
      
      // Manejar diferentes formatos de respuesta
      const data = res.data;
      if (Array.isArray(data)) {
        setCobros(data);
        setTotalMonto(data.reduce((sum: number, c: Cobro) => sum + c.monto, 0));
        setTotalPages(1);
      } else if (data.data && Array.isArray(data.data)) {
        setCobros(data.data);
        setTotalMonto(data.totalMonto || data.data.reduce((sum: number, c: Cobro) => sum + c.monto, 0));
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.warn("Formato de cobros no reconocido:", data);
        setCobros([]);
      }
    } catch (error: any) {
      console.error("Error cargando cobros:", error);
      setError(error.response?.data?.message || "Error al cargar los cobros");
      setCobros([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `RD$${value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  const formatDateTime = (date: string) => new Date(date).toLocaleString("es-DO");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link to="/pagos" className="text-gray-400 hover:text-gray-600">💰 Pagos</Link>
          <span className="text-gray-300">/</span>
          <Link to="/pagos/cxc" className="text-gray-400 hover:text-gray-600">CxC</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Historial de Cobros</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">📜 Historial de Cobros</h1>
        <p className="text-gray-500 mt-1">Registro de todos los cobros recibidos de empresas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
            <select
              value={empresaId || ""}
              onChange={(e) => { setEmpresaId(e.target.value ? Number(e.target.value) : null); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas las empresas</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => { setDesde(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => { setHasta(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setEmpresaId(null); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <span className="text-green-700 font-medium">Total cobrado en período:</span>
        <span className="text-2xl font-bold text-green-700">{formatCurrency(totalMonto)}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando cobros...</p>
          </div>
        ) : cobros.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin cobros</h3>
            <p className="text-gray-500">No hay cobros en el período seleccionado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Comprobante</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Empresa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Documento</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Método</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Monto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cobros.map((cobro) => (
                    <tr key={cobro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{cobro.numeroComprobante}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(cobro.fecha)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{cobro.empresaNombre}</td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/pagos/cxc/documentos/${cobro.documentoId}`}
                          className="text-sm text-sky-600 hover:underline"
                        >
                          {cobro.documentoNumero}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cobro.metodoPagoNombre}
                        {cobro.referencia && (
                          <span className="block text-xs text-gray-400">{cobro.referencia}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {formatCurrency(cobro.monto)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{cobro.registradoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}