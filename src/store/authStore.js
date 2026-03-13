import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      loading: false,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  finishLoading: () =>
    set({
      loading: false,
    }),
}));
