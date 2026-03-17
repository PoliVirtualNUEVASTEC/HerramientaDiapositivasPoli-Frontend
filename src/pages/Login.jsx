import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, login } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import '../styles/login.css';
import { toast } from 'sonner';
import { Logo } from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await login(email, password);

      const user = await getProfile();

      setUser(user);

      navigate('/dashboard');
    } catch (_err) {
      toast.error('Credenciales Incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay" />

      <div className="login-content">
        <h1>Bienvenido de nuevo</h1>

        <p className="subtitle">Ingresa tu cuenta para continuar</p>

        <form className="login-card" onSubmit={handleSubmit}>
          <label htmlFor="email">Correo</label>
          <input
            name="email"
            type="email"
            placeholder="correo@elpoli.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            name="password"
            type="password"
            placeholder="*****"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar'}
          </button>

          <a href="/" className="link">
            ¿Olvidaste tu contraseña?
          </a>

          <p className="register">
            ¿No tienes cuenta? <span>Regístrate</span>
          </p>

          <Logo />
        </form>
      </div>
    </div>
  );
}
