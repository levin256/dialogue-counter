import { z } from 'zod/mini';

/** 正規表現の特殊文字をエスケープして、文字どおりに一致させる。 */
export const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 空白（改行を含む）だけでできた文字列に一致する。 */
export const onlyWhiteSpaceRegex = /^\s+$/;

// 改行以外の空白（半角・全角スペース、タブなど）
const spaceRegex = /[^\S\n]/g;
const leadingSpaceRegex = /^[^\S\n]+/;

const graphemeSegmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

/**
 * 文字数を数える。見た目の1文字（書記素）を1と数えるので、絵文字や結合文字も1文字になる。
 *
 * @example
 * countCharacters('👍🏽が') // => 2
 */
export const countCharacters = (text: string) => {
  let count = 0;
  for (const _ of graphemeSegmenter.segment(text)) {
    count++;
  }
  return count;
};

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
  /** カウントしない文字（列）。登録順に取り除く */
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

/**
 * ルールに従って、カウントしない部分を取り除いたテキストを返す。
 * 行の除外 → 除外文字 → 空白 → 改行 の順に適用する。
 *
 * @param rule 何をカウントしないか
 */
export const applyCountRule = (
  text: string,
  {
    ignoreStrings,
    ignoreLinePrefixes,
    ignoreSpace,
    ignoreLineBreak,
  }: CountRule,
) => {
  const ignorePatterns = [
    ...ignoreStrings.map(
      (ignoreString) => new RegExp(escapeRegExp(ignoreString), 'g'),
    ),
    ...(ignoreSpace ? [spaceRegex] : []),
    ...(ignoreLineBreak ? [/\n/g] : []),
  ];

  // 行頭の空白は読み飛ばして判定する（インデントされた行も除外する）
  const textWithoutIgnoreLine = ignoreLinePrefixes.reduce(
    (currentText, ignoreLinePrefix) => {
      const prefix = ignoreLinePrefix.replace(leadingSpaceRegex, '');
      const lines = currentText.split(/\n/);
      return lines
        .filter(
          (line) => !line.replace(leadingSpaceRegex, '').startsWith(prefix),
        )
        .join('\n');
    },
    text,
  );
  const textWithoutIgnoreString = ignorePatterns.reduce(
    (currentText, regex) => currentText.replaceAll(regex, ''),
    textWithoutIgnoreLine,
  );
  return textWithoutIgnoreString;
};

/**
 * テキストの文字数を、ルールに従って数える。
 *
 * @param rule 何をカウントしないか
 *
 * @example
 * countText('「はい。」', DEFAULT_COUNT_RULE) // => 2
 */
export const countText = (text: string, rule: CountRule) =>
  countCharacters(applyCountRule(text, rule));
