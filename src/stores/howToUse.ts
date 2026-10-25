import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type HowToUseStore = {
  /** 使い方ダイアログを一度でも閉じたか */
  hasSeen: boolean;
  markAsSeen: () => void;
};

/**
 * 使い方ダイアログを見たかどうかを持つストア（画面の設定なので、カウントルールとは分ける）。
 *
 * localStorage の `how-to-use` に保存する。説明を大きく変えて全員にもう一度見せたいときは、
 * version を上げ、migrate で hasSeen を false に戻す。
 */
export const useHowToUseStore = create<HowToUseStore>()(
  persist(
    (set) => ({
      hasSeen: false,
      markAsSeen: () => set({ hasSeen: true }),
    }),
    {
      name: 'how-to-use',
      version: 0,
      // 既定は window.localStorage。テストで差し替えられるように、グローバルの localStorage を使う
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
