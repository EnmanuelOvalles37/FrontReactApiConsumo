import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authService } from "../Servicios/authService";
import type { User, LoginResult } from "../types/";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (usuario: string, contrasena: string) => Promise<LoginResult>;
  logout: () => void;
  hasPermission: (permiso: string) => boolean;
  loading: boolean;
  authReady: boolean;
  // Propiedades para identificar tipo de usuario
  rolId: number | null;
  esCajero: boolean;
  esBackoffice: boolean;
  esEmpleador: boolean;
  tipoUsuario: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState(false);
  
  // Estados derivados del rol
  const [rolId, setRolId] = useState<number | null>(null);
  const [esCajero, setEsCajero] = useState(false);
  const [esBackoffice, setEsBackoffice] = useState(false);
  const [esEmpleador, setEsEmpleador] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  // Funcion para actualizar estados de rol
  const actualizarEstadosRol = (userData: User | null) => {
    if (!userData) {
      setRolId(null);
      setEsCajero(false);
      setEsBackoffice(false);
      setEsEmpleador(false);
      setTipoUsuario(null);
      return;
    }

    const userRolId = userData.rolId || null;
    setRolId(userRolId);
    
    // Determinar tipo de usuario por rolId
    // Rol 4 = empleador, Rol 5 = backoffice, Rol 6 = cajero
    setEsCajero(userRolId === 6 || userData.esCajero || false);
    setEsBackoffice(userRolId === 5);
    setEsEmpleador(userRolId === 4);
    setTipoUsuario(userData.tipoUsuario || null);
  };

  // Inicializar autenticacion desde localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();

        if (isAuth && userData) {
          setIsAuthenticated(true);
          setCurrentUser(userData);
          actualizarEstadosRol(userData);
        } else {
          authService.logout();
        }
      } catch (error) {
        console.error("Error inicializando autenticacion:", error);
        authService.logout();
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    };

    initAuth();
  }, []);

  // Escuchar cambios en localStorage (para multiples pestanas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken" || e.key === "userData") {
        const isAuth = authService.isAuthenticated();
        const userData = authService.getCurrentUser();

        setIsAuthenticated(isAuth);
        setCurrentUser(isAuth ? userData : null);
        actualizarEstadosRol(isAuth ? userData : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (
    usuario: string,
    contrasena: string
  ): Promise<LoginResult> => {
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contrasena }),
      });

      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        return { success: false, message: e.message ?? "Error en login" };
      }

      const data = await resp.json();
      // data: { token, id, usuario, rol, rolId, permisos, expiracion, esCajero, tipoUsuario, asignacion }

      const userDataToStore = {
        id: data.id,
        usuario: data.usuario,
        rol: data.rol,
        rolId: data.rolId,
        permisos: data.permisos ?? [],
        expiracion: data.expiracion,
        esCajero: data.esCajero,
        tipoUsuario: data.tipoUsuario,
        asignacion: data.asignacion,
      };

      // Guardar en localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(userDataToStore));

      // Actualizar estado
      setIsAuthenticated(true);
      setCurrentUser(userDataToStore as User);
      actualizarEstadosRol(userDataToStore as User);

      return { success: true, data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error de conexion";
      return { success: false, message };
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");

    // Limpiar estado
    setIsAuthenticated(false);
    setCurrentUser(null);
    actualizarEstadosRol(null);

    // Opcional: llamar al backend para invalidar el token
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    }).catch(() => {
      // Ignorar errores en logout del backend
    });
  };

  const isAdminRole = (role?: string) => {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === "admin" || r === "administrador" || r === "superadmin";
  };

  const hasPermission = (permiso: string): boolean => {
    if (isAdminRole(currentUser?.rol)) return true;
    return currentUser?.permisos?.includes(permiso) || false;
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    hasPermission,
    loading,
    authReady,
    rolId,
    esCajero,
    esBackoffice,
    esEmpleador,
    tipoUsuario,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};