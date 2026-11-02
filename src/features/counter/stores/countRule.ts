import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import {
  CountRule,
  DEFAULT_COUNT_RULE,
  type RuleValue,
} from '../domain/countRule';

type CountRuleStore = CountRule & {
  /** 末尾に追加する。index を渡すと、その位置に入れる（削除の取り消しで、元の位置に戻すため） */
  addIgnoreString: (value: RuleValue, index?: number) => void;
  removeIgnoreString: (value: RuleValue) => void;
  /** 末尾に追加する。index を渡すと、その位置に入れる（削除の取り消しで、元の位置に戻すため） */
  addIgnoreLinePrefix: (value: RuleValue, index?: number) => void;
  removeIgnoreLinePrefix: (value: RuleValue) => void;
  setIgnoreSpace: (value: boolean) => void;
  setIgnoreLineBreak: (value: boolean) => void;
};

// 保存形式を変えるときは version を上げ、persist の migrate で古い形式を変換する
const STORAGE = { name: 'count-rule', version: 0 };

const addUnique = (
  list: readonly RuleValue[],
  value: RuleValue,
  index = list.length,
) =>
  list.includes(value)
    ? list
    : [...list.slice(0, index), value, ...list.slice(index)];

const remove = (list: readonly RuleValue[], value: RuleValue) =>
  list.filter((item) => item !== value);

/**
 * カウントルール（除外文字・行の先頭文字・空白・改行）と、その操作を持つストアを作る。
 *
 * ストレージの `count-rule` に、ルールの値だけを保存する。
 * 除外文字と行の先頭文字は、同じ値を重ねて登録しない。
 * 保存データが壊れていたら、ルール全体を初期値に戻す。
 *
 * @param getStorage 保存先を返す関数。呼んだときに例外が出たら、保存せずに動く
 */
export const createCountRuleStore = (getStorage: () => StateStorage) =>
  create<CountRuleStore>()(
    persist(
      (set) => ({
        ...DEFAULT_COUNT_RULE,
        addIgnoreString: (value, index) =>
          set((state) => ({
            ignoreStrings: addUnique(state.ignoreStrings, value, index),
          })),
        removeIgnoreString: (value) =>
          set((state) => ({
            ignoreStrings: remove(state.ignoreStrings, value),
          })),
        addIgnoreLinePrefix: (value, index) =>
          set((state) => ({
            ignoreLinePrefixes: addUnique(
              state.ignoreLinePrefixes,
              value,
              index,
            ),
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
        storage: createJSONStorage(getStorage),
        // 保存データは検証してから使う。壊れていれば、ルール全体を初期値のままにする
        merge: (saved, current) => {
          const result = CountRule.safeParse(saved);
          return result.success ? { ...current, ...result.data } : current;
        },
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

/** アプリで使う、localStorage に保存するカウントルールのストア。 */
export const useCountRuleStore = createCountRuleStore(() => localStorage);
