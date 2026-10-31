import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from '@/shared/test/createMemoryStorage';
import { DEFAULT_COUNT_RULE, RuleValue } from '../domain/countRule';
import { createCountRuleStore } from './countRule';

const saved = (state: unknown) => JSON.stringify({ state, version: 0 });

// ストアの中身のうち、ルールの値だけを取り出す
const ruleOf = (store: ReturnType<typeof createCountRuleStore>) => {
  const { ignoreStrings, ignoreLinePrefixes, ignoreSpace, ignoreLineBreak } =
    store.getState();
  return { ignoreStrings, ignoreLinePrefixes, ignoreSpace, ignoreLineBreak };
};

describe('createCountRuleStore', () => {
  it('保存データがなければ、初期値で始まる', () => {
    const storage = createMemoryStorage();
    const store = createCountRuleStore(() => storage);

    expect(ruleOf(store)).toEqual(DEFAULT_COUNT_RULE);
  });

  it('正しい保存データを読み込む', () => {
    const rule = {
      ignoreStrings: ['★'],
      ignoreLinePrefixes: ['#'],
      ignoreSpace: false,
      ignoreLineBreak: true,
    };
    const storage = createMemoryStorage({ 'count-rule': saved(rule) });
    const store = createCountRuleStore(() => storage);

    expect(ruleOf(store)).toEqual(rule);
  });

  it('壊れた保存データなら、ルール全体を初期値にする', () => {
    const storage = createMemoryStorage({
      'count-rule': saved({
        ignoreStrings: 'abc',
        ignoreLinePrefixes: ['#'],
        ignoreSpace: false,
        ignoreLineBreak: true,
      }),
    });
    const store = createCountRuleStore(() => storage);

    expect(ruleOf(store)).toEqual(DEFAULT_COUNT_RULE);
  });

  it('追加・削除・トグルの変更を保存する', () => {
    const storage = createMemoryStorage();
    const store = createCountRuleStore(() => storage);
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

  it('同じ値は重ねて追加しない', () => {
    const storage = createMemoryStorage();
    const store = createCountRuleStore(() => storage);

    store.getState().addIgnoreString(RuleValue.parse('。'));

    expect(store.getState().ignoreStrings).toEqual(
      DEFAULT_COUNT_RULE.ignoreStrings,
    );
  });
});
