import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '../test/createMemoryStorage';
import type { CountRule } from '../utils/string';
import { migrateLegacyStorage } from './migrateLegacyStorage';

const defaults: CountRule = {
  ignoreStrings: ['。'],
  ignoreLinePrefixes: ['//'],
  ignoreSpace: true,
  ignoreLineBreak: true,
};
const target = { name: 'count-rule', version: 0 };

// 旧データはオブジェクトで書けるようにして、ここで JSON にする
const createStorage = (entries: Record<string, unknown> = {}) =>
  createMemoryStorage(
    Object.fromEntries(
      Object.entries(entries).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]),
    ),
  );

const legacyStrings = (...values: string[]) => ({
  state: {
    ignoreStrings: values.map((ignoreString, i) => ({
      id: `s${i}`,
      ignoreString,
    })),
  },
  version: 0,
});

const legacyPrefixes = (...values: string[]) => ({
  state: {
    ignoreLinePrefixes: values.map((ignoreLinePrefix, i) => ({
      id: `p${i}`,
      ignoreLinePrefix,
    })),
  },
  version: 0,
});

const savedState = (storage: ReturnType<typeof createStorage>) =>
  JSON.parse(storage.map.get('count-rule') ?? 'null');

describe('migrateLegacyStorage', () => {
  it('旧キーの文字列だけを取り出して新しいキーに保存し、旧キーを消す', () => {
    const storage = createStorage({
      'ignore-strings': legacyStrings('「', '」'),
      'ignore-line-prefixes': legacyPrefixes('#'),
    });

    migrateLegacyStorage(storage, target, defaults);

    expect(savedState(storage)).toEqual({
      state: {
        ignoreStrings: ['「', '」'],
        ignoreLinePrefixes: ['#'],
        ignoreSpace: true,
        ignoreLineBreak: true,
      },
      version: 0,
    });
    expect([...storage.map.keys()]).toEqual(['count-rule']);
  });

  it('片方の旧キーしかなければ、もう片方は初期値にする', () => {
    const storage = createStorage({ 'ignore-strings': legacyStrings('a') });

    migrateLegacyStorage(storage, target, defaults);

    expect(savedState(storage).state).toMatchObject({
      ignoreStrings: ['a'],
      ignoreLinePrefixes: ['//'],
    });
  });

  it('旧データの重複を取り除く', () => {
    const storage = createStorage({
      'ignore-strings': legacyStrings('。', '、', '。'),
    });

    migrateLegacyStorage(storage, target, defaults);

    expect(savedState(storage).state.ignoreStrings).toEqual(['。', '、']);
  });

  it('空の一覧も、そのまま空として引き継ぐ', () => {
    const storage = createStorage({ 'ignore-strings': legacyStrings() });

    migrateLegacyStorage(storage, target, defaults);

    expect(savedState(storage).state.ignoreStrings).toEqual([]);
  });

  it('旧キーがなければ、何も書き込まない（初期値のまま始まる）', () => {
    const storage = createStorage();

    migrateLegacyStorage(storage, target, defaults);

    expect(storage.map.size).toBe(0);
  });

  it('新しいキーがすでにあれば、何もしない', () => {
    const storage = createStorage({
      'count-rule': { state: defaults, version: 0 },
      'ignore-strings': legacyStrings('a'),
    });

    migrateLegacyStorage(storage, target, defaults);

    expect(savedState(storage).state.ignoreStrings).toEqual(['。']);
    expect(storage.map.has('ignore-strings')).toBe(true);
  });

  it('壊れた旧データは無視して、初期値を使う', () => {
    const storage = createStorage({
      'ignore-strings': '{壊れた JSON',
      'ignore-line-prefixes': legacyPrefixes('#'),
    });

    migrateLegacyStorage(storage, target, defaults);

    expect(savedState(storage).state).toMatchObject({
      ignoreStrings: ['。'],
      ignoreLinePrefixes: ['#'],
    });
  });
});
