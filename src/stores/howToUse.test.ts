import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubLocalStorage } from '../test/stubLocalStorage';

const loadStore = async () => (await import('./howToUse')).useHowToUseStore;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useHowToUseStore', () => {
  it('保存データがなければ、まだ見ていない状態で始まる', async () => {
    stubLocalStorage();
    const store = await loadStore();

    expect(store.getState().hasSeen).toBe(false);
  });

  it('markAsSeen で見た状態になり、保存される', async () => {
    const storage = stubLocalStorage();
    const store = await loadStore();

    store.getState().markAsSeen();

    expect(store.getState().hasSeen).toBe(true);
    expect(JSON.parse(storage.map.get('how-to-use') ?? 'null')).toEqual({
      state: { hasSeen: true },
      version: 0,
    });
  });

  it('保存済みなら、見た状態で始まる', async () => {
    stubLocalStorage({
      'how-to-use': JSON.stringify({ state: { hasSeen: true }, version: 0 }),
    });
    const store = await loadStore();

    expect(store.getState().hasSeen).toBe(true);
  });
});
