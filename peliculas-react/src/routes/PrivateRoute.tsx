import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function PrivateRoute() {
  const { isAuthenticated, loading, authReady } = useAuth();

   if (loading || !authReady) {
    return <div className="p-6 text-sm opacity-70">Verificando sesión…</div>;
  }
 
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  
}