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

/** 文字数を数えるときのルール。UI の都合（id など）を持たない、ただの値。 */
export type CountRule = {
  /** カウントしない文字（列）。登録順に取り除く */
  ignoreStrings: readonly string[];
  /** この文字で始まる行はカウントしない。行頭の空白は読み飛ばして判定する */
  ignoreLinePrefixes: readonly string[];
  /** 改行以外の空白（半角・全角スペース、タブなど）をカウントしない */
  ignoreSpace: boolean;
  /** 改行をカウントしない */
  ignoreLineBreak: boolean;
};

/** 初めて使うときのルール。 */
export const DEFAULT_COUNT_RULE: CountRule = {
  ignoreStrings: ['、', '。', '「', '」', '…', '！', '？'],
  ignoreLinePrefixes: ['//'],
  ignoreSpace: true,
  ignoreLineBreak: true,
};

/**
 * ルールに従って、カウントしない部分を取り除いたテキストを返す。
 * 行の除外 → 除外文字 → 空白 → 改行 の順に適用する。
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
 * @example
 * countText('「はい。」', DEFAULT_COUNT_RULE) // => 2
 */
export const countText = (text: string, rule: CountRule) =>
  countCharacters(applyCountRule(text, rule));
