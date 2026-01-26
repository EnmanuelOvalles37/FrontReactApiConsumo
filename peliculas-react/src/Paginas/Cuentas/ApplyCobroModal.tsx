import { useState } from "react";
import axios from "axios";
import type { CxcItem } from "../../assets/types/cxc";

type Props = {
  row: CxcItem;
  onClose: () => void;
  onSuccess: (nuevoBalance: number, nuevoEstado: string) => void; // <- devolvemos datos
};

export default function ApplyCobroModal({ row, onClose, onSuccess }: Props) {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0,10));
  const [monto, setMonto] = useState<number>(row.balance);
  const [medio, setMedio] = useState<string>("EFECTIVO");
  const [ref, setRef] = useState<string>("");
  const [obs, setObs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    try {
      if (monto <= 0) { setErr("El monto debe ser mayor a 0."); return; }
      if (monto > row.balance) {
        setErr(`El monto (${monto.toFixed(2)}) excede el saldo (${row.balance.toFixed(2)}).`);
        return;
      }

      setLoading(true); setErr(null);

      const payload = {
        cxcId: row.id,
        fecha,
        monto,
        medioPago: medio,
        referencia: ref,
        observacion: obs
      };

      const { data } = await axios.post("/api/cxc/cobrar", payload);
      // data: { nuevoBalance, nuevoEstado }
      onSuccess(data.nuevoBalance, data.nuevoEstado);
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data ?? "Error registrando cobro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Aplicar cobro</h3>
        <p className="text-sm text-gray-600 mt-1">
          Cliente: <b>{row.clienteNombre}</b> — Doc: <b>{row.documento}</b><br/>
          Balance actual: <b>RD$ {row.balance.toLocaleString()}</b>
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="text-sm">
            Fecha
            <input type="date" value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>

          <label className="text-sm">
            Monto
            <input
              type="number"
              step="0.01"
              min={0.01}
              value={monto}
              onChange={e => setMonto(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Medio de pago
            <select value={medio} onChange={e => setMedio(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2">
              <option>EFECTIVO</option>
              <option>TRANSFERENCIA</option>
              <option>CHEQUE</option>
              <option>TARJETA</option>
            </select>
          </label>

          <label className="text-sm">
            Referencia (opcional)
            <input value={ref} onChange={e => setRef(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>

          <label className="text-sm">
            Observación (opcional)
            <textarea rows={3} value={obs} onChange={e => setObs(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>

          {err && <div className="rounded-lg bg-red-50 text-red-700 p-2 text-sm">{String(err)}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 border">Cancelar</button>
          <button
            onClick={submit}
            disabled={loading || monto <= 0}
            className="rounded-lg px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40"
          >
            {loading ? "Guardando..." : "Registrar cobro"}
          </button>
        </div>
      </div>
    </div>
  );
}
