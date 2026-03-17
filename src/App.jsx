import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthProvider from './auth/AuthProvider';
import Dashboard from './pages/Dashboard';
import Home from './pages/home';
import Login from './pages/Login';
import ProtectedRoute from './router/ProtectedRoute';
import SesionRoute from './router/SesionRoute';

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <SesionRoute>
                  <Login />
                </SesionRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
