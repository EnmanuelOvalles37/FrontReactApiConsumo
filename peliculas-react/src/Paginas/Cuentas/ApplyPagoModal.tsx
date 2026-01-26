// Paginas/Cuentas/ApplyPagoModal.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { CxpItem } from "../../assets/types/cxp";

type Props = {
  row: CxpItem;
  onClose: () => void;
  onSuccess: () => void; // en el padre debe llamar fetchData()
};

export default function ApplyPagoModal({ row, onClose, onSuccess }: Props) {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0,10));
  const [monto, setMonto] = useState<number>(row.balance); // valor por defecto = saldo disponible
  const [medio, setMedio] = useState<string>("EFECTIVO");
  const [ref, setRef] = useState<string>("");
  const [obs, setObs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputMontoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Enfocar monto al abrir, ayuda UX
    inputMontoRef.current?.focus();
  }, []);

  const closeIfBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);

    // Validaciones cliente
    if (row.balance <= 0) {
      setErr("Este documento no tiene saldo disponible.");
      return;
    }
    if (!monto || monto <= 0) {
      setErr("El monto debe ser mayor a 0.");
      return;
    }
    if (monto > row.balance) {
      setErr(`El monto (${monto.toFixed(2)}) no puede exceder el saldo (${row.balance.toFixed(2)}).`);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cxpId: row.id,
        fecha,
        monto,
        medioPago: medio,
        referencia: ref || null,
        observacion: obs || null,
      };

      // Si usas token JWT:
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const { data } = await axios.post("/api/cxp/pagos", payload, { headers });
      console.log("[CxP] pago ok:", data);

      // Refresca la grilla y cierra
      onSuccess();
      onClose();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "Error registrando pago";
      setErr(String(msg));
      // Si otro usuario ya saldó el doc, fuerza refresco de la lista:
      if (typeof msg === "string" && /excede el saldo|saldo \(0\.00\)/i.test(msg)) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  // Evita Enter dispare accidentalmente sin validación
  const onFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void submit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onMouseDown={closeIfBackdrop}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" onKeyDown={onFormKeyDown}>
        <h3 className="text-lg font-semibold">Aplicar pago</h3>
        <p className="text-sm text-gray-600 mt-1">
          Proveedor: <b>{row.proveedorNombre}</b> — Doc: <b>{row.documento}</b><br/>
          Balance actual: <b>RD$ {row.balance.toLocaleString()}</b>
        </p>

        <form className="mt-4 grid grid-cols-1 gap-3" onSubmit={submit}>
          <label className="text-sm">
            Fecha
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </label>

          <label className="text-sm">
            Monto
            <input
              ref={inputMontoRef}
              type="number"
              step="0.01"
              min={0.01}
              max={Math.max(0, row.balance)}   // clave: tope al saldo
              value={monto}
              onChange={e => setMonto(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </label>

          <label className="text-sm">
            Medio de pago
            <select
              value={medio}
              onChange={e => setMedio(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              <option value="CHEQUE">CHEQUE</option>
              <option value="TARJETA">TARJETA</option>
            </select>
          </label>

          <label className="text-sm">
            Referencia (opcional)
            <input
              value={ref}
              onChange={e => setRef(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="No. transferencia, #cheque, etc."
            />
          </label>

          <label className="text-sm">
            Observación (opcional)
            <textarea
              rows={3}
              value={obs}
              onChange={e => setObs(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Notas internas"
            />
          </label>

          {err && (
            <div className="rounded-lg bg-red-50 text-red-700 p-2 text-sm">{String(err)}</div>
          )}

          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 border">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || monto <= 0 || row.balance <= 0}
              className="rounded-lg px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              {loading ? "Guardando..." : "Registrar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
