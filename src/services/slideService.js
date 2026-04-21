import api from '../api/axios';

export const getSlides = async (presentationId) => {
  const res = await api.get(`/api/slides/${presentationId}`);
  return res.data;
};

export const getSlideById = async (id) => {
  const res = await api.get(`/api/slides/slide/${id}`);
  return res.data;
};

export const createSlide = async (slideData) => {
  const res = await api.post('/api/slides', slideData);
  return res.data;
};

export const updateSlide = async (id, slideData) => {
  const res = await api.put(`/api/slides/${id}`, slideData);
  return res.data;
};

export const deleteSlide = async (id) => {
  const res = await api.delete(`/api/slides/${id}`);
  return res.data;
};

export const duplicateSlide = async (id) => {
  const res = await api.post(`/api/slides/${id}/duplicate`);
  return res.data;
};
