export const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const onlyWhiteSpaceRegex = /^\s+$/;

// 改行以外の空白（半角・全角スペース、タブなど）
const spaceRegex = /[^\S\n]/g;
const leadingSpaceRegex = /^[^\S\n]+/;

const graphemeSegmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

// 見た目の 1 文字（書記素）を 1 と数える。絵文字や結合文字も 1 文字になる
export const countCharacters = (text: string) => {
  let count = 0;
  for (const _ of graphemeSegmenter.segment(text)) {
    count++;
  }
  return count;
};

// カウントのルール。UI の都合（id など）を持たない、ただの値
export type CountRule = {
  ignoreStrings: readonly string[];
  ignoreLinePrefixes: readonly string[];
  ignoreSpace: boolean;
  ignoreLineBreak: boolean;
};

// ルールに従って、カウントしない部分を取り除いたテキストを返す
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

// テキスト + ルール → 文字数
export const countText = (text: string, rule: CountRule) =>
  countCharacters(applyCountRule(text, rule));
