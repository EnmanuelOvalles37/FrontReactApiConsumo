import { useState } from "react";
import type { Cliente } from "./Clientes";

interface ClienteFiltersProps {
  clientes: Cliente[];
  onFilter: (filtered: Cliente[]) => void;
}

const ClienteFilters = ({ clientes, onFilter }: ClienteFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const groups = Array.from(new Set(clientes.map(c => c.grupo)));

  const applyFilters = () => {
    let filtered = clientes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.grupo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group filter
    if (selectedGroup) {
      filtered = filtered.filter(cliente => cliente.grupo === selectedGroup);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(cliente =>
        statusFilter === "active" ? cliente.activo : !cliente.activo
      );
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGroup("");
    setStatusFilter("all");
    onFilter(clientes);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            placeholder="Buscar por nombre, ID o grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Group Filter */}
        <div className="lg:w-48">
          <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
            Grupo
          </label>
          <select
            id="group"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">Todos los grupos</option>
            {groups.map(group => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            value={statusFilter}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={applyFilters}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Aplicar Filtros
        </button>
        
        <button
          onClick={clearFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default ClienteFilters;