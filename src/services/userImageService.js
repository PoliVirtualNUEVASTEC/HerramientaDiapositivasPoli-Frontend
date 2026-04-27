import api from '../api/axios';

export const getUserImages = async () => {
  const response = await api.get('/api/user-images');
  return response.data;
};

export const uploadUserImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/api/user-images', formData, {
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total || typeof onProgress !== 'function') {
        return;
      }

      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );

      onProgress(percent);
    },
  });

  return response.data;
};

export const markUserImageAsAccessed = async (imageId) => {
  const response = await api.post(`/api/user-images/${imageId}/access`);
  return response.data;
};

export const deleteImage = async (id) => {
  const response = await api.delete(`/api/user-images/${id}`);
  return response.data;
};
