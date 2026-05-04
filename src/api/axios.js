import axios from 'axios';

const backend_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: backend_url,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Evitar loop infinito en refresh
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Si es 401 y no se ha reintentado, intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post('/api/auth/refresh');
        // Si el refresh funciona, reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, rechazar
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
