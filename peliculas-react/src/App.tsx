
import {  Routes, Route, Navigate } from "react-router-dom";
//import type { ReactNode } from "react";
//import { AuthProvider } from "./Context/AuthContext";
import Login from "./Componentes/Login"; 
import Dashboard from "../src/Componentes/Dashboard/Dashboard";
import Clientes from "./Componentes/Clientes/Clientes";
import ClienteForm from "./Componentes/Clientes/ClientesForm";
import PrivateRoute from "./routes/PrivateRoute";
import { ClienteProvider } from "./Componentes/Clientes/RefreshContext";


function App() {

 return (
  
      <ClienteProvider>
        <Routes>
          {/* raíz → login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* pública */}
          <Route path="/login" element={<Login />} />

          {/* bloque protegido */}
          <Route element={<PrivateRoute/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/nuevo" element={<ClienteForm />} />
            <Route path="/clientes/editar/:id" element={<ClienteForm isEdit={true} />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="p-6">404 - Página no encontrada</div>} />
        </Routes>
      </ClienteProvider>
    
);
}



export default App;
