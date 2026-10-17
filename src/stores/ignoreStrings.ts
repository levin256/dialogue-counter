import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IgnoreString } from '../schemas';
import { createId } from '../utils/id';

type IgnoreStringStore = {
  ignoreStrings: IgnoreString[];
  addIgnoreString: (ignoreString: string) => void;
  removeIgnoreString: (id: string) => void;
  clearIgnoreStrings: () => void;
};

const DEFAULT_IGNORE_STRING: IgnoreString[] = [
  '、',
  '。',
  '「',
  '」',
  '…',
  '！',
  '？',
].map((ignoreString) => ({ id: createId(), ignoreString }));

export const useIgnoreStringStore = create<IgnoreStringStore>()(
  persist(
    (set) => ({
      ignoreStrings: DEFAULT_IGNORE_STRING,
      addIgnoreString: (ignoreString) =>
        set((state) => ({
          ignoreStrings: [
            ...state.ignoreStrings,
            { id: createId(), ignoreString },
          ],
        })),
      removeIgnoreString: (id) =>
        set((state) => ({
          ignoreStrings: state.ignoreStrings.filter(
            (ignoreString) => id !== ignoreString.id,
          ),
        })),
      clearIgnoreStrings: () => set({ ignoreStrings: [] }),
    }),
    { name: 'ignore-strings' },
  ),
);
