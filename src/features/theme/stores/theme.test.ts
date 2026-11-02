import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '@/shared/test/createMemoryStorage';
import { createThemeStore } from './theme';

const saved = (state: unknown) => JSON.stringify({ state, version: 0 });

describe('createThemeStore', () => {
  it('保存データがなければ、OS に合わせる', () => {
    const storage = createMemoryStorage();
    const store = createThemeStore(() => storage);

    expect(store.getState().theme).toBe('system');
  });

  it('setTheme で変わり、index.html のスクリプトが読む形で保存される', () => {
    const storage = createMemoryStorage();
    const store = createThemeStore(() => storage);

    store.getState().setTheme('dark');

    expect(store.getState().theme).toBe('dark');
    expect(JSON.parse(storage.map.get('theme') ?? 'null')).toEqual({
      state: { theme: 'dark' },
      version: 0,
    });
  });

  it('保存済みなら、そのテーマで始まる', () => {
    const storage = createMemoryStorage({ theme: saved({ theme: 'light' }) });
    const store = createThemeStore(() => storage);

    expect(store.getState().theme).toBe('light');
  });

  it('壊れた保存データなら、OS に合わせる', () => {
    const storage = createMemoryStorage({ theme: saved({ theme: 'blue' }) });
    const store = createThemeStore(() => storage);

    expect(store.getState().theme).toBe('system');
  });
});
