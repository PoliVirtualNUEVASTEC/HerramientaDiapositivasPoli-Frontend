import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { logout } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const logoutUser = useAuthStore((s) => s.logout);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();

      logoutUser();

      navigate('/login');
    } catch (error) {
      console.error('Error cerrando sesión', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">💻 PresentAI</div>

      {!isAuthenticated ? (
        <button
          type="button"
          className="login-btn"
          onClick={() => navigate('/login')}
        >
          Iniciar Sesión →
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p>{user.email}</p>

          <button type="button" className="login-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}
