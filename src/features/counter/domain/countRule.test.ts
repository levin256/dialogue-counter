import { describe, expect, it } from 'vitest';
import {
  CountRule,
  onlyWhiteSpaceRegex,
  RuleValue,
  RuleValueError,
} from './countRule';

describe('onlyWhiteSpaceRegex', () => {
  it.each([' ', '\u3000', '\t', ' \u3000\n'])(
    '空白だけの文字列 %j にマッチする',
    (value) => {
      expect(onlyWhiteSpaceRegex.test(value)).toBe(true);
    },
  );

  it.each(['a', ' a ', '。'])('空白以外を含む %j にはマッチしない', (value) => {
    expect(onlyWhiteSpaceRegex.test(value)).toBe(false);
  });

  it('文字列 "u3000" にはマッチしない', () => {
    expect(onlyWhiteSpaceRegex.test('u3000')).toBe(false);
  });
});

describe('RuleValue', () => {
  it.each(['。', '//', ' //', '……'])('%j は登録できる', (value) => {
    expect(RuleValue.safeParse(value).success).toBe(true);
  });

  it.each([
    ['空文字', '', 'empty'],
    ['空白だけ', ' \u3000\t', 'whitespace'],
  ])('%s は登録できず、理由のコードを返す', (_, value, code) => {
    expect(RuleValue.safeParse(value).error?.issues[0].message).toBe(code);
  });
});

describe('RuleValueError', () => {
  it('理由のコードだけを受け付ける', () => {
    expect(RuleValueError.safeParse('empty').success).toBe(true);
    expect(RuleValueError.safeParse('文字を入力してください。').success).toBe(
      false,
    );
  });
});

describe('CountRule', () => {
  const valid = {
    ignoreStrings: ['。'],
    ignoreLinePrefixes: ['//'],
    ignoreSpace: true,
    ignoreLineBreak: false,
  };

  it('正しい形の値を受け付ける', () => {
    expect(CountRule.safeParse(valid).success).toBe(true);
  });

  it.each([
    ['一覧が配列でない', { ...valid, ignoreStrings: 'abc' }],
    ['一覧に空文字がある', { ...valid, ignoreLinePrefixes: [''] }],
    ['トグルが boolean でない', { ...valid, ignoreSpace: 'yes' }],
    ['項目が足りない', { ignoreStrings: ['。'] }],
  ])('%s値は受け付けない', (_, value) => {
    expect(CountRule.safeParse(value).success).toBe(false);
  });
});
