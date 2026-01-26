import { useEffect, useMemo, useRef, useState } from "react";
//import axios from "axios";
import api from "../Servicios/api";

type Option = { id: string; label: string; rnc: string };

export default function AutocompleteProveedor({
  value,
  onChange,
  placeholder = "RNC o nombre",
  minChars = 2
}: {
  value: string;                       // guardas el RNC (ProveedorId)
  onChange: (newValue: string) => void;
  placeholder?: string;
  minChars?: number;
}) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const h = setTimeout(async () => {
      if (term.trim().length < minChars) { setOpts([]); return; }
      try {
        setLoading(true);
        const { data } = await api.get<{ data: Option[]; total: number }>("/api/proveedores/search", {
          params: { term: term.trim(), page: 1, pageSize: 10 }
        });
        setOpts(data.data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250); // debounce
    return () => clearTimeout(h);
  }, [term, minChars]);

  const selected = useMemo(() => opts.find(o => o.id === value), [opts, value]);

  return (
    <div ref={boxRef} className="relative">
      <input
        className="w-full border rounded px-2 py-1"
        placeholder={placeholder}
        value={selected ? `${selected.rnc} - ${selected.label}` : term}
        onChange={e => { setTerm(e.target.value); onChange(""); }}
        onFocus={() => setOpen(opts.length > 0)}
      />
      {loading && <div className="absolute right-2 top-2 text-xs text-gray-500">…</div>}
      {open && opts.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded border bg-white shadow">
          {opts.map(o => (
            <li
              key={o.id}
              className="px-2 py-1 hover:bg-gray-50 cursor-pointer"
              onClick={() => { onChange(o.id); setTerm(`${o.rnc} - ${o.label}`); setOpen(false); }}
            >
              <div className="text-sm">{o.label}</div>
              <div className="text-xs text-gray-500">{o.rnc}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
