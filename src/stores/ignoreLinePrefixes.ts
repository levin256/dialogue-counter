import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IgnoreLinePrefix } from '../schemas';

type IgnoreLinePrefixStore = {
  ignoreLinePrefixes: IgnoreLinePrefix[];
  addIgnoreLinePrefix: (ignoreLinePrefix: IgnoreLinePrefix) => void;
  removeIgnoreLinePrefix: (ignoreLinePrefix: IgnoreLinePrefix) => void;
  clearIgnoreLinePrefixes: () => void;
};

export const useIgnoreLinePrefixStore = create<IgnoreLinePrefixStore>()(
  persist(
    (set) => ({
      ignoreLinePrefixes: [],
      addIgnoreLinePrefix: (ignoreLinePrefix) =>
        set((state) => ({
          ignoreLinePrefixes: [...state.ignoreLinePrefixes, ignoreLinePrefix],
        })),
      removeIgnoreLinePrefix: (ignoreLinePrefix) =>
        set((state) => ({
          ignoreLinePrefixes: state.ignoreLinePrefixes.filter(
            (str) => str.id !== ignoreLinePrefix.id,
          ),
        })),
      clearIgnoreLinePrefixes: () => set({ ignoreLinePrefixes: [] }),
    }),
    { name: 'ignore-line-prefixes' },
  ),
);
