import { useEffect } from 'react';
import { getProfile } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function AuthProvider({ children }) {
  const setUser = useAuthStore((s) => s.setUser);
  const finishLoading = useAuthStore((s) => s.finishLoading);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getProfile();
        setUser(user);
      } catch {
        finishLoading();
      }
    };

    initAuth();
  }, [setUser, finishLoading]);

  return children;
}
