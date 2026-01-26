// Componentes/LogoutButton.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

type LogoutButtonProps = {
  className?: string;
  variant?: "text" | "button" | "icon";
  showConfirm?: boolean;
};

export default function LogoutButton({
  className = "",
  variant = "button",
  showConfirm = true,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (showConfirm) {
      if (!confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        return;
      }
    }

    logout();
    navigate("/login", { replace: true });
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
        title="Cerrar sesión"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleLogout}
        className={`text-red-600 hover:text-red-800 hover:underline ${className}`}
      >
        Cerrar sesión
      </button>
    );
  }

  // variant === "button" (default)
  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Cerrar sesión
    </button>
  );
}

// Hook para usar logout en cualquier parte
export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (showConfirm = true) => {
    if (showConfirm) {
      if (!confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        return false;
      }
    }

    logout();
    navigate("/login", { replace: true });
    return true;
  };
}