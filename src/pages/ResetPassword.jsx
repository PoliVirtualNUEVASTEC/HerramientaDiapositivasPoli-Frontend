import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../services/authService';

import '../styles/auth.css';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token');

  const [valid, setValid] = useState(null);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // validar token al cargar
  useEffect(() => {
    const checkToken = async () => {
      try {
        await validateResetToken(token);
        setValid(true);
      } catch {
        setValid(false);

        // redirigir después de 2s
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    };

    if (token) checkToken();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(token, password);

      setMessage('Contraseña actualizada');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch {
      setMessage('Token inválido o expirado');
    }
  };

  // loading
  if (valid === null) {
    return <p className="center">Validando...</p>;
  }

  // token inválido
  if (!valid) {
    return (
      <div className="auth-container">
        <div className="auth-overlay">
          <div className="auth-card">
            <h2>Enlace inválido o expirado</h2>
            <p>Serás redirigido...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-overlay">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Nueva contraseña</h2>

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Guardar contraseña</button>

          {message && <p className="auth-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
