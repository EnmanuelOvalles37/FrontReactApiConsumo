
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../Context/AuthContext";

type Tab = { to: string; label: string; permiso?: string };

export default function Tabs({
  basePath,
  tabs,
  extra,
}: {
  basePath: string;
  tabs: Tab[];
  extra?: ReactNode;
}) {
  const { hasPermission } = useAuth();
  return (
    <div className="mb-6 border-b border-gray-200 flex items-center justify-between">
      <div className="flex gap-2">
        {tabs
          .filter(t => !t.permiso || hasPermission(t.permiso))
          .map(t => (
            <NavLink
              key={t.to}
              to={`${basePath}/${t.to}`}
              className={({ isActive }) =>
                `px-4 py-2 rounded-t-md ${isActive ? "bg-white border border-b-0" : "text-gray-600 hover:text-gray-900"}`
              }
              end
            >
              {t.label}
            </NavLink>
          ))}
      </div>
      {extra}
    </div>
  );
}
