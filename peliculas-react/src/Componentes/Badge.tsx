// components/Badge.tsx
export function Badge({ children, className="" }:{children:React.ReactNode; className?:string}) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`} >{children}</span>;
}

export function RoleBadge({ role }:{role:string}) {
  const map: Record<string,string> = {
    Admin: "bg-blue-100 text-blue-700",
    Supervisor: "bg-purple-100 text-purple-700",
    Vendedor: "bg-emerald-100 text-emerald-700",
    Auditor: "bg-amber-100 text-amber-700",
    Invitado: "bg-gray-100 text-gray-700",
  };
  return <Badge className={map[role] ?? "bg-gray-100 text-gray-700"}>{role}</Badge>;
}

export function ActiveChip({ active }:{active:boolean}) {
  return <Badge className={active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{active ? "Activo" : "Inactivo"}</Badge>;
}
