import '../styles/login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Logo } from '../components/Logo';
import { register } from '../services/authService';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswords,
} from '../utils/validatesInputs';

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (fieldName, value, otherPassword = '') => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'fullName':
        if (value.trim() === '') {
          newErrors.fullName = 'El nombre es requerido';
        } else if (!validateName(value)) {
          newErrors.fullName = 'El nombre solo debe contener letras';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'email':
        if (value.trim() === '') {
          newErrors.email = 'El email es requerido';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Debe ser un email válido de @elpoli.edu.co';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (value.trim() === '') {
          newErrors.password = 'La contraseña es requerida';
        } else if (!validatePassword(value)) {
          newErrors.password =
            'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo (@$!%*?&)';
        } else {
          delete newErrors.password;
        }
        if (touched.confirmPassword) {
          validateField('confirmPassword', confirmPassword, value);
        }
        break;

      case 'confirmPassword':
        if (value.trim() === '') {
          newErrors.confirmPassword = 'Debes confirmar la contraseña';
        } else if (!validatePasswords(otherPassword || password, value)) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (touched.fullName) {
      validateField('fullName', value);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      validateField('email', value);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      validateField('password', value);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      validateField('confirmPassword', value, password);
    }
  };

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });

    switch (fieldName) {
      case 'fullName':
        validateField('fullName', fullName);
        break;
      case 'email':
        validateField('email', email);
        break;
      case 'password':
        validateField('password', password);
        break;
      case 'confirmPassword':
        validateField('confirmPassword', confirmPassword, password);
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateName(fullName)) {
      newErrors.fullName = 'El nombre solo debe contener letras';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Debe ser un email válido de @elpoli.edu.co';
    }

    if (!validatePassword(password)) {
      newErrors.password =
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo (@$!%*?&)';
    }

    if (!validatePasswords(password, confirmPassword)) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa correctamente todos los campos');
      return;
    }

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
            onChange={handleNameChange}
            onBlur={() => handleBlur('fullName')}
            className={touched.fullName && errors.fullName ? 'input-error' : ''}
            required
          />
          {touched.fullName && errors.fullName && (
            <span className="error-message">{errors.fullName}</span>
          )}

          <label htmlFor="email">Correo</label>
          <input
            name="email"
            type="email"
            placeholder="correo@elpoli.edu.co"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            className={touched.email && errors.email ? 'input-error' : ''}
            required
          />
          {touched.email && errors.email && (
            <span className="error-message">{errors.email}</span>
          )}

          <label htmlFor="password">Contraseña</label>
          <input
            name="password"
            type="password"
            placeholder="*****"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            className={touched.password && errors.password ? 'input-error' : ''}
            required
          />
          {touched.password && errors.password && (
            <span className="error-message">{errors.password}</span>
          )}

          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="*****"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => handleBlur('confirmPassword')}
            className={
              touched.confirmPassword && errors.confirmPassword
                ? 'input-error'
                : ''
            }
            required
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}

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
