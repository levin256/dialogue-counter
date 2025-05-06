import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IgnoreString } from '../schemas';

type IgnoreStringStore = {
  ignoreStrings: IgnoreString[];
  addIgnoreString: (ignoreString: IgnoreString) => void;
  removeIgnoreString: (ignoreString: IgnoreString) => void;
  clearIgnoreStrings: () => void;
};

export const useIgnoreStringStore = create<IgnoreStringStore>()(
  persist(
    (set) => ({
      ignoreStrings: [],
      addIgnoreString: (ignoreString) =>
        set((state) => ({
          ignoreStrings: [...state.ignoreStrings, ignoreString],
        })),
      removeIgnoreString: (ignoreString) =>
        set((state) => ({
          ignoreStrings: state.ignoreStrings.filter(
            (str) => str.id !== ignoreString.id,
          ),
        })),
      clearIgnoreStrings: () => set({ ignoreStrings: [] }),
    }),
    { name: 'ignore-strings' },
  ),
);
