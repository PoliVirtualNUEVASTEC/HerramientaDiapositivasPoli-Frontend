import { useNavigate } from 'react-router-dom';
import { getProfile, login } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async () => {
    await login('test@test.com', 'test1234');

    const user = await getProfile();

    setUser(user);

    navigate('/');
  };

  return (
    <button type="button" onClick={handleLogin}>
      Login
    </button>
  );
}
