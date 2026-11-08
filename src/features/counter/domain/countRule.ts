import { z } from 'zod/mini';

// 何をカウントしないかのルール（値の形と初期値）。ルールに従って数えるのは countText.ts。
// schema は、使う schema より後ろに書く必要があるので、部品から順に並べる。

/** 空白（改行を含む）だけでできた文字列に一致する。 */
export const onlyWhiteSpaceRegex = /^\s+$/;

/** 値を登録できない理由のコード。文言は画面で決める。 */
export const RuleValueError = z.enum(['empty', 'whitespace', 'duplicate']);
export type RuleValueError = z.infer<typeof RuleValueError>;

/**
 * カウントしない文字・行の先頭文字として登録できる値（値オブジェクト）。
 * 空・空白だけの文字列は、この型にならない。
 * 失敗したときのメッセージは {@link RuleValueError} のコード。
 *
 * @example
 * RuleValue.parse('。') // => '。'（RuleValue 型）
 * RuleValue.safeParse(' ').error?.issues[0].message // => 'whitespace'
 */
export const RuleValue = z
  .string()
  .check(
    z.minLength(1, 'empty' satisfies RuleValueError),
    z.refine(
      (value) => !onlyWhiteSpaceRegex.test(value),
      'whitespace' satisfies RuleValueError,
    ),
  )
  .brand<'RuleValue'>();
export type RuleValue = z.infer<typeof RuleValue>;

/**
 * 文字数を数えるときのルール。UI の都合（id など）を持たない、ただの値。
 * 保存データのように、外から来た値は {@link CountRule}.safeParse で検証してから使う。
 */
export const CountRule = z.object({
  /** カウントしない文字（列）。どれも元のテキストの上で探すので、登録順は結果に影響しない */
  ignoreStrings: z.readonly(z.array(RuleValue)),
  /** この文字で始まる行はカウントしない。行頭の空白は読み飛ばして判定する */
  ignoreLinePrefixes: z.readonly(z.array(RuleValue)),
  /** 改行以外の空白（半角・全角スペース、タブなど）をカウントしない */
  ignoreSpace: z.boolean(),
  /** 改行をカウントしない */
  ignoreLineBreak: z.boolean(),
});
export type CountRule = z.infer<typeof CountRule>;

/** 初めて使うときのルール。 */
export const DEFAULT_COUNT_RULE: CountRule = {
  ignoreStrings: ['、', '。', '「', '」', '…', '！', '？'].map((value) =>
    RuleValue.parse(value),
  ),
  ignoreLinePrefixes: [RuleValue.parse('//')],
  ignoreSpace: true,
  ignoreLineBreak: true,
};
