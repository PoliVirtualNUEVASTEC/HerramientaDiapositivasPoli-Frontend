import api from '../api/axios';

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', {
    email,
    password,
  });

  return res.data;
};

export const register = async (email, password, fullName) => {
  const res = await api.post('/api/users', {
    email,
    fullName,
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

export const forgotPassword = (email) => {
  return api.post('/api/auth/forgot-password', { email });
};

export const validateResetToken = (token) => {
  return api.get(`/api/auth/validate-reset-token?token=${token}`);
};

export const resetPassword = (token, newPassword) => {
  return api.post('/api/auth/reset-password', {
    token,
    newPassword,
  });
};
