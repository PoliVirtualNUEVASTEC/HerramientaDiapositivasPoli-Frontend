import '../styles/login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import '../styles/login.css';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Logo } from '../components/Logo';

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await register(email, password, fullName);

      navigate('/login');
      toast.success('Usuario Registrado!', {
        style: { background: 'green', color: 'white' },
      });
    } catch (err) {
      if (err.status === 409) return toast.error('Correo ya existente');
      toast.error('Error registrando usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay" />

      <div className="login-content">
        <h1>Bienvenido</h1>

        <p className="subtitle">Crea una cuenta para comenzar</p>

        <form className="login-card" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Nombre</label>
          <input
            name="fullName"
            type="text"
            placeholder="Juan Perez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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

          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="*****"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>

          <p className="register">
            ¿Ya tienes una cuenta? <Link to={'/login'}>Inicia Sesión</Link>
          </p>

          <Logo />
        </form>
      </div>
    </div>
  );
}
