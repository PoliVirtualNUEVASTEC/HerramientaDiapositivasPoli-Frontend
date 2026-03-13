import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './router/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
