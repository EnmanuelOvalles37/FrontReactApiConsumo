import { Outlet } from "react-router-dom";
import Tabs from "../Componentes/Tabs";

export default function HubLayout({ tabs }:{ tabs:{to:string; label:string}[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <Tabs items={tabs} />
      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
}