import { vi } from 'vitest';
import { createMemoryStorage } from './createMemoryStorage';

/**
 * グローバルの localStorage をテスト用のものに差し替え、モジュールの読み込み状態を消す。
 * ストアは読み込んだ時点で localStorage を読むので、このあとで `await import()` する。
 * 元に戻すには、`afterEach` で `vi.unstubAllGlobals()` を呼ぶ。
 *
 * @example
 * const storage = stubLocalStorage({ 'how-to-use': '{"state":{"hasSeen":true},"version":0}' });
 * const { useHowToUseStore } = await import('./howToUse');
 */
export const stubLocalStorage = (entries: Record<string, string> = {}) => {
  const storage = createMemoryStorage(entries);
  vi.stubGlobal('localStorage', storage);
  vi.resetModules();
  return storage;
};
