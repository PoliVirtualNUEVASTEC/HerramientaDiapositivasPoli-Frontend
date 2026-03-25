import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthProvider from './auth/AuthProvider';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import PresentationPreview from './pages/PresentationPreview';
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
            <Route path="/login" element={<SesionRoute><Login /></SesionRoute>} />
            <Route path="/forgot-password" element={<SesionRoute><ForgotPassword /></SesionRoute>} />
            <Route path="/reset-password" element={<SesionRoute><ResetPassword /></SesionRoute>} />
            <Route path="/register" element={<SesionRoute><Register /></SesionRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/preview/:id" element={<ProtectedRoute><PresentationPreview /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

 export default App;