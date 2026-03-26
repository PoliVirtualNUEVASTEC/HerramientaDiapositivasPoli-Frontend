import api from '../api/axios';

// PDF
export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/api/presentations/pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

// TEXTO
export const sendText = async (text) => {
  const res = await api.post('/api/presentations/text', { text });
  return res.data;
};

// OBTENER UNA PRESENTACIÓN
export const getPresentation = async (id) => {
  const res = await api.get(`/api/presentations/${id}`);
  return res.data;
};