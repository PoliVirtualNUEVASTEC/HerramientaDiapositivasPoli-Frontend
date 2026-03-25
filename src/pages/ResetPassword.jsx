import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../services/authService';
import { validatePassword, validatePasswords } from '../utils/validatesInputs';

import '../styles/auth.css';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token');

  const [valid, setValid] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

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

  const validateForm = () => {
    if (!validatePassword(password)) {
      setError(
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo (@$!%*?&)',
      );
      return false;
    }

    if (!validatePasswords(password, confirmPassword)) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor completa correctamente todos los campos');
      return;
    }

    try {
      await resetPassword(token, password);
      setError('');
      toast.success('Contraseña Actualizada', {
        style: { background: 'green', color: 'white' },
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch {
      toast.error('Token inválido o expirado');
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
          <h2>Cambiar Contraseña</h2>
          <label htmlFor="password">Nueva contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Guardar contraseña</button>

          {error && (
            <p className="auth-message" style={{ color: 'red' }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
