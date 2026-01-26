import { useEffect, useMemo, useState } from "react";
import {
  buscarClientePorCedulaGlobal,
  getMisProveedores,
  getMisTiendas,
  getMisCajas,
  postRegistrarConsumo,
} from "../../assets/api/consumos";
import type { ClienteMatch, Opcion } from "../../types/consumos";

export default function RegistroConsumoPage() {
  // ---- Cliente
  const [cedula, setCedula] = useState("");
  const [cliente, setCliente] = useState<ClienteMatch | null>(null);
  const [opcionesCliente, setOpcionesCliente] = useState<ClienteMatch[]>([]);
  const [buscandoCli, setBuscandoCli] = useState(false);
  const [errCli, setErrCli] = useState<string | null>(null);

  // ---- Proveedor / Tienda / Caja
  const [proveedores, setProveedores] = useState<Opcion[]>([]);
  const [tiendas, setTiendas] = useState<Opcion[]>([]);
  const [cajas, setCajas] = useState<Opcion[]>([]);

  const [proveedorId, setProveedorId] = useState<number | "">("");
  const [tiendaId, setTiendaId] = useState<number | "">("");
  const [cajaId, setCajaId] = useState<number | "">("");

  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [cargandoTiendas, setCargandoTiendas] = useState(false);
  const [cargandoCajas, setCargandoCajas] = useState(false);

  // ---- Consumo
  const [monto, setMonto] = useState<string>("");
  const [nota, setNota] = useState<string>("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // ========== Buscar cliente por cédula (endpoint global) ==========
  const buscarCliente = async () => {
    setErrCli(null);
    setMensaje(null);
    setCliente(null);
    setOpcionesCliente([]);

    const clean = (cedula ?? "").replace(/\D/g, "");
    if (!clean) {
      setErrCli("Debe ingresar una cédula");
      return;
    }

    setBuscandoCli(true);
    try {
      const data = await buscarClientePorCedulaGlobal(clean);
      if (data.matches.length === 0) {
        setErrCli("Cliente no encontrado");
      } else if (data.matches.length === 1) {
        setCliente(data.matches[0]);
      } else {
        // múltiples empresas: permitir que el usuario elija
        setOpcionesCliente(data.matches);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrCli(e?.response?.status === 404 ? "Cliente no encontrado" : "Error buscando cliente");
    } finally {
      setBuscandoCli(false);
    }
  };

  // ========== Cargar “mis proveedores/tiendas/cajas” ==========
  useEffect(() => {
    (async () => {
      setCargandoProveedores(true);
      try {
        const data = await getMisProveedores();
        setProveedores(data);
        // autoselección si solo hay uno
        if (data.length === 1) setProveedorId(data[0].id);
      } finally {
        setCargandoProveedores(false);
      }
    })();
  }, []);

  useEffect(() => {
    // reset dependencias
    setTiendas([]);
    setTiendaId("");
    setCajas([]);
    setCajaId("");
    setMensaje(null);
    if (proveedorId === "") return;

    (async () => {
      setCargandoTiendas(true);
      try {
        const data = await getMisTiendas(proveedorId);
        setTiendas(data);
        if (data.length === 1) setTiendaId(data[0].id);
      } finally {
        setCargandoTiendas(false);
      }
    })();
  }, [proveedorId]);

  useEffect(() => {
    setCajas([]);
    setCajaId("");
    setMensaje(null);
    if (proveedorId === "" || tiendaId === "") return;

    (async () => {
      setCargandoCajas(true);
      try {
        const data = await getMisCajas(proveedorId as number, tiendaId as number);
        setCajas(data);
        if (data.length === 1) setCajaId(data[0].id);
      } finally {
        setCargandoCajas(false);
      }
    })();
  }, [proveedorId, tiendaId]);

  // ========== Enviar consumo ==========
  const puedeGuardar = useMemo(() => {
    const montoVal = Number(monto);
    return !!cliente && !!proveedorId && !!tiendaId && !!cajaId && Number.isFinite(montoVal) && montoVal > 0;
  }, [cliente, proveedorId, tiendaId, cajaId, monto]);

  const onGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    setMensaje(null);

    if (!puedeGuardar) {
      setErrorForm("Complete todos los campos requeridos y un monto válido.");
      return;
    }

    setGuardando(true);
    try {
      const resp = await postRegistrarConsumo({
        clienteId: (cliente as ClienteMatch).clienteId,
        proveedorId: proveedorId as number,
        tiendaId: tiendaId as number,
        cajaId: cajaId as number,
        monto: Number(monto),
        nota: nota?.trim() || undefined,
      });
      setMensaje(`Consumo registrado (#${resp.id}).`);
      // opcional: limpiar monto/nota
      setMonto("");
      setNota("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "No se pudo registrar el consumo.";
      setErrorForm(msg);
    } finally {
      setGuardando(false);
    }
  };

  // ========== UI ==========
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Registrar consumo</h1>

      {/* Buscar cliente */}
      <div className="mb-4">
        <label className="block text-sm">Cédula del cliente</label>
        <div className="flex gap-2 mt-1">
          <input
            className="border rounded-lg px-3 py-2 w-full"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Ej. 00100000000"
          />
          <button
            type="button"
            onClick={buscarCliente}
            disabled={buscandoCli}
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-50 hover:opacity-90"
          >
            {buscandoCli ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {errCli && <p className="text-sm text-red-600 mt-2">{errCli}</p>}

        {/* Selección cuando hay múltiples coincidencias */}
        {!cliente && opcionesCliente.length > 0 && (
          <div className="mt-3 border rounded-lg p-3">
            <p className="text-sm mb-2">Selecciona el cliente/empresa:</p>
            <ul className="space-y-1">
              {opcionesCliente.map((o) => (
                <li key={`${o.empresaId}-${o.clienteId}`}>
                  <button
                    type="button"
                    onClick={() => setCliente(o)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                  >
                    {o.nombre} — {o.empresaNombre} (Saldo: RD$ {o.saldo})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resumen del cliente seleccionado */}
        {cliente && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <p className="font-medium">{cliente.nombre}</p>
            <p className="text-sm text-gray-600">
              Empresa: {cliente.empresaNombre} | Saldo: RD$ {cliente.saldo}
            </p>
          </div>
        )}
      </div>

      {/* Selección Proveedor → Tienda → Caja */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm">Proveedor</label>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : "")}
            disabled={cargandoProveedores}
          >
            <option value="">Seleccione…</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm">Tienda</label>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={tiendaId}
            onChange={(e) => setTiendaId(e.target.value ? Number(e.target.value) : "")}
            disabled={!proveedorId || cargandoTiendas}
          >
            <option value="">{proveedorId ? "Seleccione…" : "Seleccione proveedor"}</option>
            {tiendas.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm">Caja</label>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={cajaId}
            onChange={(e) => setCajaId(e.target.value ? Number(e.target.value) : "")}
            disabled={!proveedorId || !tiendaId || cargandoCajas}
          >
            <option value="">
              {tiendaId ? "Seleccione…" : "Seleccione tienda"}
            </option>
            {cajas.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form consumo */}
      <form onSubmit={onGuardar} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Monto (RD$)</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              inputMode="decimal"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Nota (opcional)</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Detalle del consumo…"
            />
          </div>
        </div>

        {errorForm && <p className="text-sm text-red-600">{errorForm}</p>}
        {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!puedeGuardar || guardando}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50 hover:opacity-90"
          >
            {guardando ? "Guardando…" : "Registrar consumo"}
          </button>
        </div>
      </form>
    </div>
  );
}

