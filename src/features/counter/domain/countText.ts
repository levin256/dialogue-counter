import type { CountRule } from './countRule';

// ルールに従って、テキストの文字数を数える。公開する関数を先に、中で使う部品を後ろに並べる。

/** 元のテキストの一部と、それをカウントするか。 */
export type CountSegment = {
  text: string;
  counted: boolean;
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
  const ignorePatterns = [
    ...ignoreStrings.map(
      (ignoreString) => new RegExp(escapeRegExp(ignoreString), 'g'),
    ),
    ...(ignoreSpace ? [spaceRegex] : []),
    ...(ignoreLineBreak ? [/\n/g] : []),
  ];
  const ignoredRanges = [
    ...ignoredLineRanges(text, ignoreLinePrefixes),
    ...ignorePatterns.flatMap((regex) => matchRanges(text, regex)),
  ];

  // 元のテキストの位置（UTF-16 の 1 単位）ごとに、カウントしないか
  const ignored = new Array<boolean>(text.length).fill(false);
  for (const [start, end] of ignoredRanges) {
    ignored.fill(true, start, end);
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

/** 元のテキストの範囲（UTF-16 の位置）。start から、end の手前まで。 */
type Range = [start: number, end: number];

/**
 * 指定した文字で始まる行を探し、その行と隣の改行 1 つを合わせた範囲を返す。
 * 行頭の空白は読み飛ばして判定する（インデントされた行も除外する）。
 *
 * 隣の改行を含めるのは、行を取り除いて残りの行を改行でつないだときと、残る改行の数を同じにするため。
 * - 後ろに数える行が残っていれば、後ろの改行を含める
 * - 残っていなければ、前の改行を含める。最後の行には、後ろの改行がないことがあるため。
 *   テキストの先頭の行には前の改行もないので、行だけにする
 *
 * @param text 元のテキスト
 * @param linePrefixes この文字で始まる行を除外する
 *
 * @example
 * ignoredLineRanges('a\n//b\nc', ['//']) // => [[2, 6]]（'//b\n'）
 * ignoredLineRanges('a\n//b', ['//']) // => [[1, 5]]（'\n//b'）
 * ignoredLineRanges('//a\n//b', ['//']) // => [[0, 3], [3, 7]]（'//a' と '\n//b'）
 */
const ignoredLineRanges = (
  text: string,
  linePrefixes: readonly string[],
): Range[] => {
  const prefixes = linePrefixes.map((prefix) =>
    prefix.replace(leadingSpaceRegex, ''),
  );
  const lines = text.split('\n');
  const isIgnoredLine = lines.map((line) => {
    const trimmedLine = line.replace(leadingSpaceRegex, '');
    return prefixes.some((prefix) => trimmedLine.startsWith(prefix));
  });
  const lastCountedLine = isIgnoredLine.lastIndexOf(false);

  const ranges: Range[] = [];
  let lineStart = 0;
  lines.forEach((line, i) => {
    // 行の最後の文字の次の位置。後ろに改行があれば、その改行の位置になる
    const lineEnd = lineStart + line.length;
    if (isIgnoredLine[i]) {
      const hasCountedLineAfter = i < lastCountedLine;
      ranges.push(
        hasCountedLineAfter
          ? [lineStart, lineEnd + 1]
          : [Math.max(lineStart - 1, 0), lineEnd],
      );
    }
    // 改行を 1 つ飛ばして、次の行の先頭へ
    lineStart = lineEnd + 1;
  });
  return ranges;
};

/**
 * 正規表現に一致する範囲を、すべて返す。
 *
 * @param text 元のテキスト
 * @param regex g フラグを付けた正規表現
 *
 * @example
 * matchRanges('a。b。', /。/g) // => [[1, 2], [3, 4]]
 */
const matchRanges = (text: string, regex: RegExp): Range[] =>
  Array.from(
    text.matchAll(regex),
    (match): Range => [match.index, match.index + match[0].length],
  );

/**
 * 正規表現の特殊文字をエスケープして、文字どおりに一致させる。
 *
 * @param string 正規表現に埋め込みたい文字列
 */
const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 改行以外の空白（半角・全角スペース、タブなど）
const spaceRegex = /[^\S\n]/g;
const leadingSpaceRegex = /^[^\S\n]+/;

const graphemeSegmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
