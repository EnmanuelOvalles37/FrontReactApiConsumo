/*import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import image from "../assets/20943930.jpg";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password);     
      

      if (result.success && result.data) {
        const { esCajero, tipoUsuario } = result.data;        
        

        // Determinar a dónde redirigir según el tipo de usuario
        let redirectPath = "/dashboard"; // Default

        if (esCajero || tipoUsuario === "cajero" || tipoUsuario === "proveedor_admin" || tipoUsuario === "proveedor_supervisor") {
          redirectPath = "/dashboard-cajero";
        }

        
        
        // Usar setTimeout para asegurar que el estado se actualice antes de navegar
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
        
      } else {
        setError(result.message || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center font-mono bg-gradient-to-r from-cyan-500 from-10% via-indigo-500 via-50% to-sky-500 to-100%">
      <div className="flex shadow-2xl">
        <div
          className="flex flex-col items-center justify-center text-center p-20 gap-8 bg-white rounded-2xl xl:rounded-tr-none xl:rounded-br-none"
        >
          <h1 className="text-5xl font-bold">Bienvenido</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col text-2xl text-left gap-1">
              <span>Usuario</span>
              <input
                className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            <div className="flex flex-col text-2xl text-left gap-1">
              <span>Contraseña</span>
              <input
                type="password"
                className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </div>

            <div className="flex gap-1 items-center">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-base">
                Recordarme
              </label>
            </div>

            {/* Mensaje de error /}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              className="px-10 py-2 text-2xl rounded-md bg-gradient-to-tr from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <p className="font-semibold">
            ¿Tienes una cuenta?{" "}
            <a className="text-blue-400 hover:underline" href="#">
              Regístrate
            </a>
          </p>
        </div>
        <img
          src={image}
          alt=""
          className="w-[450px] object-cover xl:rounded-tr-2xl xl:rounded-br-2xl xl:block hidden"
        />
      </div>
    </section>
  );
};

export default Login; ////////////////////

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import image from "../assets/20943930.jpg";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password);

      if (result.success && result.data) {
        const { tipoUsuario } = result.data;

        // Determinar a dónde redirigir según el tipo de usuario
        const redirectPath = getRedirectPath(tipoUsuario);

        console.log("Login exitoso:", {
          tipoUsuario,
          redirectPath
        });

        // Usar setTimeout para asegurar que el estado se actualice antes de navegar
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);

      } else {
        setError(result.message || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determina la ruta de redirección según el tipo de usuario
   /
  const getRedirectPath = (tipoUsuario: string): string => {
    const rutas: Record<string, string> = {
      // Empleado individual (cliente) - ve su crédito y consumos personales
      "empleado": "/mi-cuenta",
      
      // Empleador (empresa) - ve sus empleados y documentos CxC
      "empleador": "/dashboard-empleador",
      
      // Backoffice de proveedor - ve tiendas, cajeros, reportes del proveedor
      "backoffice": "/dashboard-backoffice",
      
      // Cajero - registra consumos
      "cajero": "/dashboard-cajero",
      "proveedor_admin": "/dashboard-cajero",
      "proveedor_supervisor": "/dashboard-cajero",
      
      // Administrativos - dashboard completo
      "admin": "/dashboard",
      "contabilidad": "/dashboard",
      "usuario": "/dashboard",
    };

    return rutas[tipoUsuario?.toLowerCase()] || "/dashboard";
  };

  return (
    <section className="min-h-screen flex items-center justify-center font-mono bg-gradient-to-r from-cyan-500 from-10% via-indigo-500 via-50% to-sky-500 to-100%">
      <div className="flex shadow-2xl">
        <div
          className="flex flex-col items-center justify-center text-center p-20 gap-8 bg-white rounded-2xl xl:rounded-tr-none xl:rounded-br-none"
        >
          <h1 className="text-5xl font-bold">Bienvenido</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col text-2xl text-left gap-1">
              <span>Usuario</span>
              <input
                className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            <div className="flex flex-col text-2xl text-left gap-1">
              <span>Contraseña</span>
              <input
                type="password"
                className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </div>

            <div className="flex gap-1 items-center">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-base">
                Recordarme
              </label>
            </div>

            {/* Mensaje de error /}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              className="px-10 py-2 text-2xl rounded-md bg-gradient-to-tr from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <p className="font-semibold">
            ¿Tienes una cuenta?{" "}
            <a className="text-blue-400 hover:underline" href="#">
              Regístrate
            </a>
          </p>
        </div>
        <img
          src={image}
          alt=""
          className="w-[450px] object-cover xl:rounded-tr-2xl xl:rounded-br-2xl xl:block hidden"
        />
      </div>
    </section>
  );
};

export default Login; */


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import image from "../assets/20943930.jpg";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password);

      if (result.success && result.data) {
        const { tipoUsuario, requiereCambioContrasena } = result.data;

        // Si requiere cambio de contraseña, redirigir a esa página
        if (requiereCambioContrasena) {
          setTimeout(() => {
            navigate("/cambiar-contrasena", { 
              replace: true,
              state: { primerLogin: true }
            });
          }, 100);
          return;
        }

        // Redirección según tipo de usuario
        const redirectPath = getRedirectPath(tipoUsuario);

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);

      } else {
        setError(result.message || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getRedirectPath = (tipoUsuario: string): string => {
    const rutas: Record<string, string> = {
      "empleado": "/mi-cuenta",
      "empleador": "/dashboard-empleador",
      "backoffice": "/dashboard-backoffice",
      "cajero": "/dashboard-cajero",
      "proveedor_admin": "/dashboard-cajero",
      "proveedor_supervisor": "/dashboard-cajero",
      "admin": "/dashboard",
      "contabilidad": "/dashboard",
      "usuario": "/dashboard",
    };
    return rutas[tipoUsuario?.toLowerCase()] || "/dashboard";
  };

  return (
    <section className="min-h-screen flex items-center justify-center font-mono bg-gradient-to-r from-cyan-500 from-10% via-indigo-500 via-50% to-sky-500 to-100%">
      <div className="flex shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center p-20 gap-8 bg-white rounded-2xl xl:rounded-tr-none xl:rounded-br-none">
          <h1 className="text-5xl font-bold">Bienvenido</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col text-2xl text-left gap-1">
              <span>Usuario / Cédula</span>
              <input
                className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                placeholder="Usuario o número de cédula"
                required
              />
            </div>

            <div className="flex flex-col text-2xl text-left gap-1">
              <span>Contraseña</span>
              <input
                type="password"
                className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </div>

            <div className="flex gap-1 items-center">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-base">
                Recordarme
              </label>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              className="px-10 py-2 text-2xl rounded-md bg-gradient-to-tr from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-2">
            Empleados: Ingrese con su número de cédula
          </p>
        </div>
        <img
          src={image}
          alt=""
          className="w-[450px] object-cover xl:rounded-tr-2xl xl:rounded-br-2xl xl:block hidden"
        />
      </div>
    </section>
  );
};

export default Login;