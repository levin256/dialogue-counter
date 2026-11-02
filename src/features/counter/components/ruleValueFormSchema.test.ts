import { describe, expect, it } from 'vitest';
import { RuleValue } from '../domain/countRule';
import {
  createRuleValueFormSchema,
  toErrorMessage,
} from './ruleValueFormSchema';

const schema = createRuleValueFormSchema([RuleValue.parse('。')]);
const errorOf = (value: string) =>
  schema.safeParse({ value }).error?.issues[0].message;

describe('createRuleValueFormSchema', () => {
  it('登録されていない値は追加できる', () => {
    expect(schema.safeParse({ value: '、' }).success).toBe(true);
  });

  it.each([
    ['空文字', '', 'empty'],
    ['空白だけ', ' ', 'whitespace'],
    ['登録済み', '。', 'duplicate'],
  ])('%s の値は、理由のコードを返す', (_, value, code) => {
    expect(errorOf(value)).toBe(code);
  });
});

describe('toErrorMessage', () => {
  it.each([
    ['empty', '文字を入力してください。'],
    ['whitespace', '空白を指定できません。'],
    ['duplicate', 'すでに登録されています。'],
  ])('%s を文言に変える', (code, message) => {
    expect(toErrorMessage(code)).toBe(message);
  });

  it('知らないコードは、そのまま返す', () => {
    expect(toErrorMessage('unknown')).toBe('unknown');
  });
});
