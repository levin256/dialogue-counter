import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type CountRule,
  DEFAULT_COUNT_RULE,
  type RuleValue,
} from '../utils/string';
import { migrateLegacyStorage } from './migrateLegacyStorage';

type CountRuleStore = CountRule & {
  addIgnoreString: (value: RuleValue) => void;
  removeIgnoreString: (value: RuleValue) => void;
  addIgnoreLinePrefix: (value: RuleValue) => void;
  removeIgnoreLinePrefix: (value: RuleValue) => void;
  setIgnoreSpace: (value: boolean) => void;
  setIgnoreLineBreak: (value: boolean) => void;
};

// 保存形式を変えるときは version を上げ、persist の migrate で古い形式を変換する
const STORAGE = { name: 'count-rule', version: 0 };

migrateLegacyStorage(localStorage, STORAGE, DEFAULT_COUNT_RULE);

const addUnique = (list: readonly RuleValue[], value: RuleValue) =>
  list.includes(value) ? list : [...list, value];

const remove = (list: readonly RuleValue[], value: RuleValue) =>
  list.filter((item) => item !== value);

/**
 * カウントルール（除外文字・行の先頭文字・空白・改行）と、その操作を持つストア。
 *
 * localStorage の `count-rule` に、ルールの値だけを保存する。
 * 統合前のキー（`ignore-strings` / `ignore-line-prefixes`）のデータは、初回に移行する。
 * 除外文字と行の先頭文字は、同じ値を重ねて登録しない。
 */
export const useCountRuleStore = create<CountRuleStore>()(
  persist(
    (set) => ({
      ...DEFAULT_COUNT_RULE,
      addIgnoreString: (value) =>
        set((state) => ({
          ignoreStrings: addUnique(state.ignoreStrings, value),
        })),
      removeIgnoreString: (value) =>
        set((state) => ({ ignoreStrings: remove(state.ignoreStrings, value) })),
      addIgnoreLinePrefix: (value) =>
        set((state) => ({
          ignoreLinePrefixes: addUnique(state.ignoreLinePrefixes, value),
        })),
      removeIgnoreLinePrefix: (value) =>
        set((state) => ({
          ignoreLinePrefixes: remove(state.ignoreLinePrefixes, value),
        })),
      setIgnoreSpace: (ignoreSpace) => set({ ignoreSpace }),
      setIgnoreLineBreak: (ignoreLineBreak) => set({ ignoreLineBreak }),
    }),
    {
      ...STORAGE,
      // ストアに値が増えても、ルール以外は保存しない
      partialize: ({
        ignoreStrings,
        ignoreLinePrefixes,
        ignoreSpace,
        ignoreLineBreak,
      }): CountRule => ({
        ignoreStrings,
        ignoreLinePrefixes,
        ignoreSpace,
        ignoreLineBreak,
      }),
    },
  ),
);
