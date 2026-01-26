import { useState } from "react";

interface ClienteActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActivate?: (ids: string[]) => void;
  onDeactivate?: (ids: string[]) => void;
  onExport?: (ids: string[]) => void;
}

const ClienteActions = ({
  selectedIds,
  onClearSelection,
  onActivate,
  onDeactivate,
  onExport
}: ClienteActionsProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleActivate = () => {
    if (onActivate) {
      onActivate(selectedIds);
      onClearSelection();
    }
  };

  const handleDeactivate = () => {
    if (onDeactivate) {
      onDeactivate(selectedIds);
      onClearSelection();
    }
  };

  const handleExport = async () => {
    if (onExport) {
      setIsExporting(true);
      await onExport(selectedIds);
      setIsExporting(false);
      onClearSelection();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
            {selectedIds.length} cliente(s) seleccionado(s)
          </div>
          
          <button
            onClick={onClearSelection}
            className="text-cyan-600 hover:text-cyan-800 text-sm font-medium transition-colors"
          >
            Deseleccionar
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Activate/Deactivate Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleActivate}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Activar clientes seleccionados"
            >
              <span>✅</span>
              Activar
            </button>
            
            <button
              onClick={handleDeactivate}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Desactivar clientes seleccionados"
            >
              <span>❌</span>
              Desactivar
            </button>
          </div>

          {/* Export/Print Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Exportar clientes seleccionados"
            >
              <span>{isExporting ? "⏳" : "📊"}</span>
              {isExporting ? "Exportando..." : "Exportar"}
            </button>
            
            <button
              onClick={handlePrint}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Imprimir lista"
            >
              <span>🖨️</span>
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Info */}
      <div className="mt-3 pt-3 border-t border-cyan-200">
        <p className="text-sm text-cyan-700">
          💡 <strong>Acciones disponibles:</strong> Puedes activar/desactivar múltiples clientes 
          o exportar la selección para reportes.
        </p>
      </div>
    </div>
  );
};

export default ClienteActions;