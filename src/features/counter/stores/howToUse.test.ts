import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '@/test/createMemoryStorage';
import { createHowToUseStore } from './howToUse';

describe('createHowToUseStore', () => {
  it('保存データがなければ、まだ見ていない状態で始まる', () => {
    const storage = createMemoryStorage();
    const store = createHowToUseStore(() => storage);

    expect(store.getState().hasSeen).toBe(false);
  });

  it('markAsSeen で見た状態になり、保存される', () => {
    const storage = createMemoryStorage();
    const store = createHowToUseStore(() => storage);

    store.getState().markAsSeen();

    expect(store.getState().hasSeen).toBe(true);
    expect(JSON.parse(storage.map.get('how-to-use') ?? 'null')).toEqual({
      state: { hasSeen: true },
      version: 0,
    });
  });

  it('保存済みなら、見た状態で始まる', () => {
    const storage = createMemoryStorage({
      'how-to-use': JSON.stringify({ state: { hasSeen: true }, version: 0 }),
    });
    const store = createHowToUseStore(() => storage);

    expect(store.getState().hasSeen).toBe(true);
  });
});
