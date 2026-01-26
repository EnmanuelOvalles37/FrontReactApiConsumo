// components/Confirm.tsx
export function Confirmaciones({open, title, message, onCancel, onConfirm}:{open:boolean; title:string; message:string; onCancel:()=>void; onConfirm:()=>void}) {
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl">
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded border">Cancelar</button>
          <button onClick={onConfirm} className="px-3 py-1.5 rounded bg-red-600 text-white">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
