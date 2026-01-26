import type { Cliente } from "./Clientes";

interface ClienteCardProps {
  cliente: Cliente;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const ClienteCard = ({
  cliente,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}: ClienteCardProps) => {
  const saldoPercentage = (cliente.saldo / cliente.saldoOriginal) * 100;
  const isLowBalance = saldoPercentage < 30;
  const isZeroBalance = cliente.saldo === 0;

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 border-2 ${
        isSelected
          ? "border-cyan-500 ring-2 ring-cyan-200"
          : "border-white hover:border-cyan-100"
      }`}
    >
      {/* Header with Selection */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(cliente.id)}
            className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500"
          />
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            cliente.activo
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {cliente.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      {/* Client Info */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {cliente.nombre}
        </h3>
        <p className="text-gray-600 text-sm mb-1">
          <span className="font-medium">ID:</span> {cliente.id}
        </p>
        <p className="text-gray-600 text-sm mb-1">
          <span className="font-medium">Grupo:</span> {cliente.grupo}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Día corte:</span> {cliente.diaCorte}
        </p>
      </div>

      {/* Balance Info */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Saldo actual:</span>
          <span
            className={`text-lg font-bold ${
              isZeroBalance
                ? "text-gray-600"
                : isLowBalance
                ? "text-amber-600"
                : "text-green-600"
            }`}
          >
            RD$ {cliente.saldo.toLocaleString()}
          </span>
        </div>
        
        {/* Balance Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000"
            style={{ width: `${saldoPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>RD$ 0</span>
          <span>RD$ {cliente.saldoOriginal.toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200">
        {canEdit && (
          <button
            onClick={() => onEdit(cliente.id)}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Editar
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={() => onDelete(cliente.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default ClienteCard;