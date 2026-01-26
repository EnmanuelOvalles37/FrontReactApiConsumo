// src/Componentes/Comprobantes/ModalImpresion.tsx
// Modal de impresión obligatoria post-consumo/reverso

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ComprobanteTicket, { type DatosComprobante } from "./ComprobanteTicket";
import ComprobanteCarta from "./ComprobanteCarta";

type FormatoImpresion = "ticket" | "carta";

interface ModalImpresionProps {
  open: boolean;
  datos: DatosComprobante | null;
  onClose: () => void;
  onImpreso: () => void;
}

export default function ModalImpresion({ 
  open, 
  datos, 
  onClose, 
  onImpreso 
}: ModalImpresionProps) {
  const [formato, setFormato] = useState<FormatoImpresion>("ticket");
  const [impreso, setImpreso] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);
  
  const ticketRef = useRef<HTMLDivElement>(null);
  const cartaRef = useRef<HTMLDivElement>(null);

  // Configuración de impresión para ticket
  const handlePrintTicket = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Comprobante_${datos?.id || ""}`,
    onBeforePrint: () => {
      setImprimiendo(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setImprimiendo(false);
      setImpreso(true);
    },
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
  });

  // Configuración de impresión para carta
  const handlePrintCarta = useReactToPrint({
    contentRef: cartaRef,
    documentTitle: `Comprobante_${datos?.id || ""}`,
    onBeforePrint: () => {
      setImprimiendo(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setImprimiendo(false);
      setImpreso(true);
    },
    pageStyle: `
      @page {
        size: letter;
        margin: 10mm;
      }
    `,
  });

  const handleImprimir = () => {
    if (formato === "ticket") {
      handlePrintTicket();
    } else {
      handlePrintCarta();
    }
  };

  const handleCerrar = () => {
    if (!impreso) {
      const confirmar = confirm(
        "⚠️ No ha impreso el comprobante.\n\n¿Está seguro que desea continuar sin imprimir?"
      );
      if (!confirmar) return;
    }
    setImpreso(false);
    onImpreso();
    onClose();
  };

  if (!open || !datos) return null;

  const esReverso = datos.tipo === "REVERSO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-2xl ${
          esReverso 
            ? "bg-gradient-to-r from-red-500 to-red-600" 
            : "bg-gradient-to-r from-emerald-500 to-emerald-600"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{esReverso ? "↩️" : "✅"}</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {esReverso ? "Devolución Registrada" : "Consumo Registrado"}
                </h2>
                <p className="text-white/80 text-sm">
                  Transacción #{datos.id.toString().padStart(8, "0")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Monto</p>
              <p className="text-2xl font-bold text-white">
                {esReverso ? "-" : ""}RD${datos.monto.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Selector de formato */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Seleccione el formato de impresión:</p>
          <div className="flex gap-3">
            <button
              onClick={() => setFormato("ticket")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                formato === "ticket"
                  ? "border-sky-500 bg-sky-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🧾</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Ticket (80mm)</p>
                  <p className="text-xs text-gray-500">Para impresora térmica POS</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setFormato("carta")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                formato === "carta"
                  ? "border-sky-500 bg-sky-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📄</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Carta</p>
                  <p className="text-xs text-gray-500">Para impresora normal</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Vista previa */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <p className="text-sm text-gray-500 mb-3 text-center">Vista previa del comprobante:</p>
          
          <div className="flex justify-center">
            {formato === "ticket" ? (
              <div className="bg-white shadow-lg border">
                <ComprobanteTicket ref={ticketRef} datos={datos} />
              </div>
            ) : (
              <div className="bg-white shadow-lg border w-full max-w-2xl">
                <ComprobanteCarta ref={cartaRef} datos={datos} />
              </div>
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {impreso ? (
                <span className="flex items-center gap-2 text-green-600 text-sm">
                  <span>✅</span> Comprobante impreso
                </span>
              ) : (
                <span className="flex items-center gap-2 text-amber-600 text-sm">
                  <span>⚠️</span> Debe imprimir el comprobante
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCerrar}
                className={`px-5 py-2.5 rounded-xl transition-colors font-medium ${
                  impreso
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {impreso ? "Continuar" : "Omitir"}
              </button>
              <button
                onClick={handleImprimir}
                disabled={imprimiendo}
                className={`px-6 py-2.5 rounded-xl transition-colors font-medium flex items-center gap-2 ${
                  esReverso
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                } disabled:opacity-50`}
              >
                {imprimiendo ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Imprimiendo...
                  </>
                ) : (
                  <>
                    <span>🖨️</span>
                    Imprimir Comprobante
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}