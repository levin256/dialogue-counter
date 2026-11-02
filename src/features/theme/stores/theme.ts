import { z } from 'zod/mini';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

/** 画面のテーマ。`system` は OS の設定に合わせる。 */
export const Theme = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof Theme>;

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const SavedTheme = z.object({ theme: Theme });

/**
 * 選んだテーマを持つストアを作る。
 *
 * ストレージの `theme` に保存する。読み込み時のちらつきを防ぐため、`index.html` のスクリプトも
 * 同じキーを読んで、描画の前に `<html data-theme>` を付けている。保存形式を変えるときは、そちらも直すこと。
 *
 * @param getStorage 保存先を返す関数。呼んだときに例外が出たら、保存せずに動く
 */
export const createThemeStore = (getStorage: () => StateStorage) =>
  create<ThemeStore>()(
    persist(
      (set) => ({
        theme: 'system',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'theme',
        version: 0,
        storage: createJSONStorage(getStorage),
        // 保存データは検証してから使う。壊れていれば、OS に合わせる
        merge: (saved, current) => {
          const result = SavedTheme.safeParse(saved);
          return result.success ? { ...current, ...result.data } : current;
        },
        partialize: ({ theme }) => ({ theme }),
      },
    ),
  );

/** アプリで使う、localStorage に保存するテーマのストア。 */
export const useThemeStore = createThemeStore(() => localStorage);
