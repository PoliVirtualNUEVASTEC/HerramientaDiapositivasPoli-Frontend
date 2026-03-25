import { useState } from 'react';
import { forgotPassword } from '../services/authService';
import '../styles/auth.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await forgotPassword(email);
      toast.success('Correo de recuperación enviado!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch {
      toast.error('Error Enviando correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Recuperar contraseña</h2>
          <label htmlFor="email">Ingresa tu correo</label>
          <input
            type="email"
            name="email"
            placeholder="correo@elpoli.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">
            {!loading ? 'Enviar enlace' : 'Enviado enlace...'}
          </button>
        </form>
      </div>
    </div>
  );
}
