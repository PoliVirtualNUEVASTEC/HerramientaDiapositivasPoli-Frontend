import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthProvider from './auth/AuthProvider';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import EditPresentation from './pages/EditPresentation';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import PresentationPreview from './pages/PresentationPreview';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './router/ProtectedRoute';
import SesionRoute from './router/SesionRoute';

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <>
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
                path="/forgot-password"
                element={
                  <SesionRoute>
                    <ForgotPassword />
                  </SesionRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <SesionRoute>
                    <ResetPassword />
                  </SesionRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <SesionRoute>
                    <Register />
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
              <Route
                path="/preview/:id"
                element={
                  <ProtectedRoute>
                    <PresentationPreview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditPresentation />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
