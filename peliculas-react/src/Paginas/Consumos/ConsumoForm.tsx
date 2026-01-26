// Componentes/ConsumoForm.tsx
import { useEffect, useMemo, useState } from "react";
import { consumosApi, type EmpresaLite, type ClienteLite, type ProveedorLite } from "../../assets/api/consumosApi";

type Props = {
  // opcional: post-acción tras guardar (p.ej. navegar o limpiar)
  onSaved?: (consumoId?: number) => void;
};

export default function ConsumoForm({ onSaved }: Props) {
  // selects
  const [empresas, setEmpresas] = useState<EmpresaLite[]>([]);
  const [empresaId, setEmpresaId] = useState<number | "">("");

  const [clientes, setClientes] = useState<ClienteLite[]>([]);
  const [clienteId, setClienteId] = useState<number | "">("");

  const [proveedores, setProveedores] = useState<ProveedorLite[]>([]);
  const [proveedorId, setProveedorId] = useState<number | "">("");

  // campos del consumo
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [monto, setMonto] = useState<number>(0);
  const [concepto, setConcepto] = useState<string>("");
  const [referencia, setReferencia] = useState<string>("");

  // UI
  const [loadingInit, setLoadingInit] = useState<boolean>(false);
  const [loadingClientes, setLoadingClientes] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // saldo cliente seleccionado
  const selectedCliente = useMemo(
    () => clientes.find(c => c.id === clienteId),
    [clientes, clienteId]
  );

  const saldoAntes = selectedCliente?.saldo ?? null;
  const saldoDespues = useMemo(
    () => (saldoAntes !== null ? saldoAntes - (monto || 0) : null),
    [saldoAntes, monto]
  );

  // cargar combos iniciales
  useEffect(() => {
    (async () => {
      try {
        setLoadingInit(true);
        setErr(null);

        const [emp, prov] = await Promise.all([
          consumosApi.empresas(),
          consumosApi.proveedores(),
        ]);

        setEmpresas(emp);
        setProveedores(prov);

        // seleccionar por defecto la primera empresa si existe
        if (emp.length > 0) setEmpresaId(emp[0].id);
        if (prov.length > 0) setProveedorId(prov[0].id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.response?.data ?? "No se pudieron cargar empresas/proveedores.");
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  // cargar clientes de la empresa seleccionada
  useEffect(() => {
    if (!empresaId) { setClientes([]); setClienteId(""); return; }
    (async () => {
      try {
        setLoadingClientes(true);
        setErr(null);
        const cls = await consumosApi.clientes(Number(empresaId));
        // solo activos (opcional)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setClientes(cls.filter((c: { activo: any; }) => c.activo));
        setClienteId(cls.length > 0 ? cls[0].id : "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.response?.data ?? "No se pudieron cargar los clientes.");
      } finally {
        setLoadingClientes(false);
      }
    })();
  }, [empresaId]);

  const reset = () => {
    setMonto(0);
    setConcepto("");
    setReferencia("");
    setFecha(new Date().toISOString().slice(0, 10));
    setOk(null);
    setErr(null);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setErr(null);
      setOk(null);

      // validaciones básicas
      if (!empresaId) return setErr("Seleccione una empresa.");
      if (!clienteId) return setErr("Seleccione un cliente.");
      if (!proveedorId) return setErr("Seleccione un proveedor.");
      if (!fecha) return setErr("Seleccione la fecha.");
      if (!monto || monto <= 0) return setErr("Ingrese un monto mayor a 0.");

      // payload
      const payload = {
        empresaId: Number(empresaId),
        clienteId: Number(clienteId),
        proveedorId: Number(proveedorId),
        fecha: new Date(fecha).toISOString(), // envío ISO
        monto: Number(monto),
        concepto: concepto.trim() || undefined,
        referencia: referencia.trim() || undefined,
      };

      const { data } = await consumosApi.crear(payload);
      setOk("Consumo registrado correctamente.");
      onSaved?.(typeof data === "number" ? data : undefined);

      // actualizar saldo local del cliente
      if (selectedCliente) {
        selectedCliente.saldo = selectedCliente.saldo - payload.monto;
        setClientes(prev => prev.map(c => (c.id === selectedCliente.id ? { ...selectedCliente } : c)));
      }

      // limpiar campos opcionalmente
      reset();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data ?? "No se pudo registrar el consumo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-3xl">
      <h2 className="text-lg font-semibold">Registrar consumo</h2>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {/* Empresa */}
        <label className="text-sm">
          Empresa
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value ? Number(e.target.value) : "")}
            disabled={loadingInit}
          >
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </label>

        {/* Proveedor */}
        <label className="text-sm">
          Proveedor
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : "")}
            disabled={loadingInit}
          >
            {proveedores.filter(p => p.activo).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </label>

        {/* Cliente */}
        <label className="text-sm md:col-span-2">
          Cliente
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : "")}
            disabled={!empresaId || loadingClientes}
          >
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                [{c.codigo}] {c.nombre}
              </option>
            ))}
          </select>
          {loadingClientes && <p className="text-xs text-gray-500 mt-1">Cargando clientes…</p>}
        </label>

        {/* Fecha */}
        <label className="text-sm">
          Fecha
          <input
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>

        {/* Monto */}
        <label className="text-sm">
          Monto
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            placeholder="0.00"
          />
        </label>

        {/* Concepto */}
        <label className="text-sm md:col-span-2">
          Concepto (opcional)
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Descripción breve"
          />
        </label>

        {/* Referencia */}
        <label className="text-sm md:col-span-2">
          Referencia (opcional)
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Factura/Ticket externo"
          />
        </label>
      </div>

      {/* Saldo antes/después */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Saldo actual del cliente</p>
          <p className="font-semibold">
            {saldoAntes !== null ? `RD$ ${saldoAntes.toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Saldo después del consumo</p>
          <p className="font-semibold">
            {saldoDespues !== null ? `RD$ ${saldoDespues.toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {err && <div className="mt-3 rounded-lg bg-red-50 text-red-700 p-2 text-sm">{err}</div>}
      {ok && <div className="mt-3 rounded-lg bg-green-50 text-green-700 p-2 text-sm">{ok}</div>}

      {/* Acciones */}
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={reset}
          className="rounded-lg px-4 py-2 border"
          disabled={saving}
        >
          Limpiar
        </button>
        <button
          onClick={submit}
          disabled={saving || !empresaId || !clienteId || !proveedorId}
          className="rounded-lg px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40"
        >
          {saving ? "Registrando..." : "Registrar"}
        </button>
      </div>
    </div>
  );
}
