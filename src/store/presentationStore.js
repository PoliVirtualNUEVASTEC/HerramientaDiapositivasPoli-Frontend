import { create } from 'zustand';

export const usePresentationStore = create((set) => ({
  presentation: null,
  setPresentation: (presentation) => set({ presentation }),
  clearPresentation: () => set({ presentation: null }),
}));
