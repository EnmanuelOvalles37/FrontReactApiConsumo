import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido al Dashboard 🎉</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Dashboard;
