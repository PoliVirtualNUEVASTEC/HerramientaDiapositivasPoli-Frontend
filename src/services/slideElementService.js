import api from '../api/axios';

export const createElement = async (
  slideId,
  type,
  content,
  positionX,
  positionY,
  width,
  height,
  styles,
  order,
) => {
  const res = await api.post('/api/slide-elements', {
    slideId,
    type,
    content,
    positionX,
    positionY,
    width,
    height,
    styles,
    order,
  });
  return res.data;
};
export const updateElement = async (
  id,
  type,
  content,
  positionX,
  positionY,
  width,
  height,
  styles,
  order,
) => {
  const res = await api.put(`/api/slide-elements/${id}`, {
    type,
    content,
    positionX,
    positionY,
    width,
    height,
    styles,
    order,
  });
  return res.data;
};

export const deleteElement = async (id) => {
  const res = await api.delete(`/api/slide-elements/${id}`);
  return res.data;
};
