import api from '../api/axios';

// PDF
export const uploadPDF = async (file, numberOfSlides) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('numberOfSlides', numberOfSlides);

  const res = await api.post('/api/presentations/pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

// TEXTO
export const sendText = async (text, numberOfSlides) => {
  const res = await api.post('/api/presentations/text', {
    text,
    numberOfSlides,
  });
  return res.data;
};

// OBTENER UNA PRESENTACIÓN
export const getPresentation = async (id) => {
  const res = await api.get(`/api/presentations/${id}`);
  return res.data;
};

export const getPresentations = async () => {
  const res = await api.get(`/api/presentations/`);
  return res.data;
};

export const deletePresentation = async (id) => {
  const res = await api.delete(`/api/presentations/${id}`);
  return res.data;
};
