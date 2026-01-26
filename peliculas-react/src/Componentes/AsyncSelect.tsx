// src/components/AsyncSelect.tsx
import { useEffect, useState } from "react";
import { useDebouncedValue } from "../Hooks/useDebouncedValue";
import type { LookupItem } from "../Servicios/lookupApi";

type Props = {
  value?: string | null;
  onChange: (value: string | null) => void;
  fetcher: (q: string, page?: number, pageSize?: number) => Promise<{ data: LookupItem[]; total: number }>;
  placeholder?: string;
  disabled?: boolean;
};

export default function AsyncSelect({ value, onChange, fetcher, placeholder, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(false);

  const debounced = useDebouncedValue(q, 350);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetcher(debounced, 1, 10);
        if (!alive) return;
        setItems(res.data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [debounced, fetcher]);

  const selected = items.find(i => i.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full rounded-xl border px-3 py-2 text-left bg-white"
      >
        {selected?.label || placeholder || "Seleccionar..."}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow">
          <div className="p-2">
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-lg border px-2 py-1"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {loading && <div className="px-3 py-2 text-sm text-gray-500">Cargando…</div>}
            {!loading && items.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">Sin resultados</div>
            )}
            {!loading && items.map(it => (
              <button
                key={it.value}
                type="button"
                onClick={() => { onChange(it.value); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
