/**
 * テスト用の、メモリ上で動く localStorage の代わり。
 * 中身は `map` で直接確かめられる。
 *
 * @example
 * const storage = createMemoryStorage({ key: 'value' });
 * storage.setItem('other', '1');
 * expect([...storage.map.keys()]).toEqual(['key', 'other']);
 */
export const createMemoryStorage = (entries: Record<string, string> = {}) => {
  const map = new Map(Object.entries(entries));
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & {
    map: Map<string, string>;
  };
};
