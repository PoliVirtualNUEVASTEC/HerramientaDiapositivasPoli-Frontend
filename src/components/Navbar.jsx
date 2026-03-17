import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { logout } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const logoutUser = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();

      logoutUser();

      navigate('/login');
      toast.success('Sesión Cerrada', {
        style: { background: 'green', color: 'white' },
      });
    } catch (error) {
      console.error('Error cerrando sesión', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="navbar">
      <Logo />
      {!isAuthenticated ? (
        <button
          type="button"
          className="login-btn"
          onClick={() => navigate('/login')}
        >
          <LogIn size={15} /> Iniciar Sesión
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p>{user.email}</p>

          <button
            type="button"
            className="login-btn logout-btn"
            onClick={handleLogout}
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            <LogOut size={20} />
          </button>
        </div>
      )}
    </nav>
  );
}
