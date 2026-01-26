import { createContext, useContext, useState, type ReactNode } from "react";

interface ClienteContextType {
  refreshTrigger: number;
  refreshClientes: () => void;
}

const ClienteContext = createContext<ClienteContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error("useCliente debe usarse dentro de un ClienteProvider");
  }
  return context;
};

export const ClienteProvider = ({ children }: { children: ReactNode }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshClientes = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <ClienteContext.Provider value={{ refreshTrigger, refreshClientes }}>
      {children}
    </ClienteContext.Provider>
  );
};
