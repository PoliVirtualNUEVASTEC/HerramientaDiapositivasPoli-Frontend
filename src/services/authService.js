import api from '../api/axios';

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', {
    email,
    password,
  });

  return res.data;
};

export const logout = async () => {
  await api.post('/api/auth/logout');
};

export const getProfile = async () => {
  const res = await api.get('/api/auth/profile');

  return res.data;
};
