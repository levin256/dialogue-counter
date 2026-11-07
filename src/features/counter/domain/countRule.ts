import { z } from 'zod/mini';

/**
 * 正規表現の特殊文字をエスケープして、文字どおりに一致させる。
 *
 * @param string 正規表現に埋め込みたい文字列
 */
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
 * @param text 数えるテキスト
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

/** 元のテキストの一部と、それをカウントするか。 */
export type CountSegment = {
  text: string;
  counted: boolean;
};

/**
 * ルールに従って、元のテキストを「カウントする区間」と「カウントしない区間」に分ける。
 * 区間をすべてつなげると、元のテキストに戻る。隣り合う区間は、counted が必ず違う。
 *
 * 行・除外文字・空白・改行は、どれも元のテキストの上で探し、見つかった範囲をすべて合わせてカウントしない。
 * そのため、適用する順番で結果は変わらない。
 *
 * @param text 元のテキスト
 * @param rule 何をカウントしないか
 *
 * @example
 * applyCountRule('「はい」', DEFAULT_COUNT_RULE)
 * // => [{ text: '「', counted: false }, { text: 'はい', counted: true }, { text: '」', counted: false }]
 */
export const applyCountRule = (
  text: string,
  {
    ignoreStrings,
    ignoreLinePrefixes,
    ignoreSpace,
    ignoreLineBreak,
  }: CountRule,
): CountSegment[] => {
  // 元のテキストの位置（UTF-16 の 1 単位）ごとに、カウントしないか
  const ignored = new Array<boolean>(text.length).fill(false);

  // 行頭の空白は読み飛ばして判定する（インデントされた行も除外する）
  const prefixes = ignoreLinePrefixes.map((prefix) =>
    prefix.replace(leadingSpaceRegex, ''),
  );
  const lines = text.split('\n');
  const isIgnoredLine = lines.map((line) => {
    const trimmedLine = line.replace(leadingSpaceRegex, '');
    return prefixes.some((prefix) => trimmedLine.startsWith(prefix));
  });
  // 行を取り除いたのと同じ数の改行を残すため、残る行より前の行は後ろの改行を、後ろの行は前の改行を、行と一緒に除外する
  const lastCountedLine = isIgnoredLine.lastIndexOf(false);
  let lineStart = 0;
  lines.forEach((line, i) => {
    const lineEnd = lineStart + line.length;
    if (isIgnoredLine[i]) {
      if (i < lastCountedLine) {
        ignored.fill(true, lineStart, lineEnd + 1);
      } else {
        ignored.fill(true, Math.max(lineStart - 1, 0), lineEnd);
      }
    }
    lineStart = lineEnd + 1;
  });

  const ignorePatterns = [
    ...ignoreStrings.map(
      (ignoreString) => new RegExp(escapeRegExp(ignoreString), 'g'),
    ),
    ...(ignoreSpace ? [spaceRegex] : []),
    ...(ignoreLineBreak ? [/\n/g] : []),
  ];
  for (const regex of ignorePatterns) {
    for (const match of text.matchAll(regex)) {
      ignored.fill(true, match.index, match.index + match[0].length);
    }
  }

  // カウントするかが同じ位置の並びを、1 つの区間にまとめる
  const segments: CountSegment[] = [];
  let segmentStart = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || ignored[i] !== ignored[segmentStart]) {
      segments.push({
        text: text.slice(segmentStart, i),
        counted: !ignored[segmentStart],
      });
      segmentStart = i;
    }
  }
  return segments;
};

/**
 * テキストの文字数を、ルールに従って数える。
 *
 * @param text 数えるテキスト
 * @param rule 何をカウントしないか
 *
 * @example
 * countText('「はい。」', DEFAULT_COUNT_RULE) // => 2
 */
export const countText = (text: string, rule: CountRule) =>
  // 区間ごとに数えて足すと、絵文字や結合文字の途中で区間が切れたときに数がずれるので、つなげてから数える
  countCharacters(
    applyCountRule(text, rule)
      .filter(({ counted }) => counted)
      .map(({ text }) => text)
      .join(''),
  );
