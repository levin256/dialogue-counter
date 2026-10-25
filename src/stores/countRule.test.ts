import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubLocalStorage } from '../test/stubLocalStorage';
import { DEFAULT_COUNT_RULE, RuleValue } from '../utils/string';

const loadStore = async () => (await import('./countRule')).useCountRuleStore;

const saved = (state: unknown) => JSON.stringify({ state, version: 0 });

// ストアの中身のうち、ルールの値だけを取り出す
const ruleOf = (store: Awaited<ReturnType<typeof loadStore>>) => {
  const { ignoreStrings, ignoreLinePrefixes, ignoreSpace, ignoreLineBreak } =
    store.getState();
  return { ignoreStrings, ignoreLinePrefixes, ignoreSpace, ignoreLineBreak };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useCountRuleStore', () => {
  it('保存データがなければ、初期値で始まる', async () => {
    stubLocalStorage();
    const store = await loadStore();

    expect(ruleOf(store)).toEqual(DEFAULT_COUNT_RULE);
  });

  it('正しい保存データを読み込む', async () => {
    const rule = {
      ignoreStrings: ['★'],
      ignoreLinePrefixes: ['#'],
      ignoreSpace: false,
      ignoreLineBreak: true,
    };
    stubLocalStorage({ 'count-rule': saved(rule) });
    const store = await loadStore();

    expect(ruleOf(store)).toEqual(rule);
  });

  it('壊れた保存データなら、ルール全体を初期値にする', async () => {
    stubLocalStorage({
      'count-rule': saved({
        ignoreStrings: 'abc',
        ignoreLinePrefixes: ['#'],
        ignoreSpace: false,
        ignoreLineBreak: true,
      }),
    });
    const store = await loadStore();

    expect(ruleOf(store)).toEqual(DEFAULT_COUNT_RULE);
  });

  it('追加・削除・トグルの変更を保存する', async () => {
    const storage = stubLocalStorage();
    const store = await loadStore();
    const { addIgnoreString, removeIgnoreLinePrefix, setIgnoreSpace } =
      store.getState();

    addIgnoreString(RuleValue.parse('★'));
    removeIgnoreLinePrefix(RuleValue.parse('//'));
    setIgnoreSpace(false);

    expect(JSON.parse(storage.map.get('count-rule') ?? 'null').state).toEqual({
      ...DEFAULT_COUNT_RULE,
      ignoreStrings: [...DEFAULT_COUNT_RULE.ignoreStrings, '★'],
      ignoreLinePrefixes: [],
      ignoreSpace: false,
    });
  });

  it('同じ値は重ねて追加しない', async () => {
    stubLocalStorage();
    const store = await loadStore();

    store.getState().addIgnoreString(RuleValue.parse('。'));

    expect(store.getState().ignoreStrings).toEqual(
      DEFAULT_COUNT_RULE.ignoreStrings,
    );
  });

  it('統合前のキーのデータがあれば、移行して読み込む', async () => {
    const storage = stubLocalStorage({
      'ignore-strings': saved({
        ignoreStrings: [{ id: 's0', ignoreString: '★' }],
      }),
    });
    const store = await loadStore();

    expect(store.getState().ignoreStrings).toEqual(['★']);
    expect(storage.map.has('ignore-strings')).toBe(false);
  });
});
