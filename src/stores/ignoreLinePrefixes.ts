import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IgnoreLinePrefix } from '../schemas';

type IgnoreLinePrefixStore = {
  ignoreLinePrefixes: IgnoreLinePrefix[];
  addIgnoreLinePrefix: (ignoreLinePrefix: string) => void;
  removeIgnoreLinePrefix: (id: string) => void;
  clearIgnoreLinePrefixes: () => void;
};

const DEFAULT_IGNORE_LINE_PREFIX: IgnoreLinePrefix[] = ['//'].map(
  (ignoreLinePrefix) => ({ id: uuidv4(), ignoreLinePrefix }),
);

export const useIgnoreLinePrefixStore = create<IgnoreLinePrefixStore>()(
  persist(
    (set) => ({
      ignoreLinePrefixes: DEFAULT_IGNORE_LINE_PREFIX,
      addIgnoreLinePrefix: (ignoreLinePrefix) =>
        set((state) => ({
          ignoreLinePrefixes: [
            ...state.ignoreLinePrefixes,
            { id: uuidv4(), ignoreLinePrefix },
          ],
        })),
      removeIgnoreLinePrefix: (id) =>
        set((state) => ({
          ignoreLinePrefixes: state.ignoreLinePrefixes.filter(
            (ignoreLinePrefix) => id !== ignoreLinePrefix.id,
          ),
        })),
      clearIgnoreLinePrefixes: () => set({ ignoreLinePrefixes: [] }),
    }),
    { name: 'ignore-line-prefixes' },
  ),
);
