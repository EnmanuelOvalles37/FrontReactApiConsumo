//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.tsx'
//import { AuthProvider } from "./Context/AuthContext";
import React from "react";
//import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from './Context/AuthContext';
import { ClienteProvider } from "./Componentes/Clientes/RefreshContext";
//import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')!).render(
  
   <React.StrictMode>
    <Router>
      <AuthProvider>
        <ClienteProvider>
          <AppRoutes />         
        </ClienteProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
  
)
