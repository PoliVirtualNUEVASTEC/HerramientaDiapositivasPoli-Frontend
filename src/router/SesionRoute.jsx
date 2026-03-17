import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function SesionRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
