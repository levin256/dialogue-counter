import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

type HowToUseStore = {
  /** 使い方ダイアログを一度でも閉じたか */
  hasSeen: boolean;
  markAsSeen: () => void;
};

/**
 * 使い方ダイアログを見たかどうかを持つストアを作る（画面の設定なので、カウントルールとは分ける）。
 *
 * ストレージの `how-to-use` に保存する。説明を大きく変えて全員にもう一度見せたいときは、
 * version を上げ、migrate で hasSeen を false に戻す。
 *
 * @param getStorage 保存先を返す関数。呼んだときに例外が出たら、保存せずに動く
 */
export const createHowToUseStore = (getStorage: () => StateStorage) =>
  create<HowToUseStore>()(
    persist(
      (set) => ({
        hasSeen: false,
        markAsSeen: () => set({ hasSeen: true }),
      }),
      {
        name: 'how-to-use',
        version: 0,
        storage: createJSONStorage(getStorage),
      },
    ),
  );

/** アプリで使う、localStorage に保存する使い方ダイアログのストア。 */
export const useHowToUseStore = createHowToUseStore(() => localStorage);
