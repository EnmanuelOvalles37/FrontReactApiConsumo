// Componentes/Clientes/ClienteModal.tsx
import { useEffect, useState } from "react";
import { clientesApi } from "../../assets/api/ClientesApi";

import api from "../../Servicios/api";

type Cliente = {
  id: number;
  //codigo: string;
  nombre: string;
  cedula?: string;
  //grupo: string;
  saldoOriginal: number;
 // diaCorte: number;
  activo: boolean;  
};

type CreditoDisponible = {
  limiteEmpresa: number;
  limiteAsignadoEmpleados: number;
  disponibleParaAsignar: number;
  porcentajeUtilizado: number;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  empresaId: number;
  cliente?: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ClienteModal({ open, mode, empresaId, cliente, onClose, onSaved }: Props) {
  const isEdit = mode === "edit";
  
  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [saldoOriginal, setSaldoOriginal] = useState<number>(0);
  const [activo, setActivo] = useState(true);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingCredito, setLoadingCredito] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  // Información de crédito disponible
  const [creditoInfo, setCreditoInfo] = useState<CreditoDisponible | null>(null);

  // Cargar información de crédito disponible
  useEffect(() => {
    if (!open || !empresaId) return;
    
    let alive = true;
    (async () => {
      try {
        setLoadingCredito(true);
        const response = await api.get(`/empresas/${empresaId}/credito-disponible`);
        if (alive) {
          setCreditoInfo(response.data);
        }
      } catch (error) {
        console.error("Error cargando crédito disponible:", error);
      } finally {
        if (alive) setLoadingCredito(false);
      }
    })();
    
    return () => { alive = false; };
  }, [open, empresaId]);

  // Inicializar campos del formulario
  useEffect(() => {
    if (!open) return;
    setErr(null);
    
    if (isEdit && cliente) {
      setNombre(cliente.nombre);
      setCedula(cliente.cedula ?? "");
      setSaldoOriginal(cliente.saldoOriginal);
      setActivo(cliente.activo);
    } else {
      setNombre("");
      setCedula("");
      setSaldoOriginal(0);
      setActivo(true);
    }
  }, [open, isEdit, cliente]);

  // Calcular el límite máximo que se puede asignar
  const calcularLimiteMaximo = (): number => {
    if (!creditoInfo) return Infinity;
    
    if (isEdit && cliente) {
      // En edición, el disponible es lo que hay + lo que ya tiene este cliente
      return creditoInfo.disponibleParaAsignar + cliente.saldoOriginal;
    }
    
    return creditoInfo.disponibleParaAsignar;
  };

  const limiteMaximo = calcularLimiteMaximo();
  const excedeLimite = saldoOriginal > limiteMaximo && creditoInfo?.limiteEmpresa !== 0;

  const save = async () => {
    try {
      setLoading(true);
      setErr(null);

      // Validaciones básicas
      if (!nombre.trim()) {
        setErr("El nombre es requerido");
        return;
      }

      if (saldoOriginal < 0) {
        setErr("El límite de crédito no puede ser negativo");
        return;
      }

      // Validar límite de crédito de la empresa
      if (excedeLimite) {
        setErr(`El límite de crédito excede el disponible de la empresa (RD$${limiteMaximo.toLocaleString()})`);
        return;
      }

      const payload = {
        nombre: nombre.trim(),
        cedula: cedula.trim() || undefined,
        saldoOriginal: Number(saldoOriginal) || 0,
        activo
      };

      if (isEdit && cliente) {
        await clientesApi.update(empresaId, cliente.id, payload);
      } else {
        await clientesApi.create(empresaId, payload);
      }

      onSaved();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const errorData = e?.response?.data;
      if (typeof errorData === "object" && errorData?.message) {
        setErr(errorData.message);
      } else if (typeof errorData === "string") {
        setErr(errorData);
      } else {
        setErr("No se pudo guardar el empleado");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold">
          {isEdit ? "Editar empleado" : "Nuevo empleado"}
        </h3>

        {/* Información de crédito disponible */}
        {loadingCredito ? (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Cargando información de crédito...</p>
          </div>
        ) : creditoInfo && creditoInfo.limiteEmpresa > 0 ? (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Crédito de la empresa</span>
              <span className="text-xs text-blue-600">
                {creditoInfo.porcentajeUtilizado}% utilizado
              </span>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  creditoInfo.porcentajeUtilizado >= 90 
                    ? "bg-red-500" 
                    : creditoInfo.porcentajeUtilizado >= 70 
                      ? "bg-yellow-500" 
                      : "bg-blue-600"
                }`}
                style={{ width: `${Math.min(creditoInfo.porcentajeUtilizado, 100)}%` }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Límite empresa</span>
                <p className="font-semibold text-gray-800">
                  RD${creditoInfo.limiteEmpresa.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Asignado</span>
                <p className="font-semibold text-orange-600">
                  RD${creditoInfo.limiteAsignadoEmpleados.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Disponible</span>
                <p className={`font-semibold ${
                  creditoInfo.disponibleParaAsignar <= 0 ? "text-red-600" : "text-green-600"
                }`}>
                  RD${creditoInfo.disponibleParaAsignar.toLocaleString()}
                </p>
              </div>
            </div>

            {isEdit && cliente && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  💡 Este empleado tiene RD${cliente.saldoOriginal.toLocaleString()} asignado. 
                  Puede asignar hasta <strong>RD${limiteMaximo.toLocaleString()}</strong>
                </p>
              </div>
            )}
          </div>
        ) : creditoInfo && creditoInfo.limiteEmpresa === 0 ? (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ La empresa no tiene límite de crédito configurado. 
              Se permite asignar cualquier monto.
            </p>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          <label className="text-sm">
            Nombre <span className="text-red-500">*</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre completo del empleado"
            />
          </label>

          <label className="text-sm">
            Cédula
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={cedula}
              onChange={e => setCedula(e.target.value)}
              placeholder="000-0000000-0"
            />
          </label>

          <label className="text-sm">
            Límite de Crédito
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">RD$</span>
              <input
                className={`mt-1 w-full rounded-lg border px-3 py-2 pl-12 ${
                  excedeLimite ? "border-red-500 bg-red-50" : ""
                }`}
                type="number"
                step="0.01"
                min="0"
                max={limiteMaximo !== Infinity ? limiteMaximo : undefined}
                value={saldoOriginal}
                onChange={e => setSaldoOriginal(Number(e.target.value))}
              />
            </div>
            {excedeLimite && (
              <p className="text-xs text-red-600 mt-1">
                Excede el límite disponible (máx: RD${limiteMaximo.toLocaleString()})
              </p>
            )}
            {!excedeLimite && creditoInfo && creditoInfo.limiteEmpresa > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Máximo disponible: RD${limiteMaximo.toLocaleString()}
              </p>
            )}
          </label>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activo}
              onChange={e => setActivo(e.target.checked)}
              className="rounded"
            />
            Empleado activo
          </label>

          {err && (
            <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm border border-red-200">
              ❌ {err}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 border hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={loading || excedeLimite}
            className="rounded-lg px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}