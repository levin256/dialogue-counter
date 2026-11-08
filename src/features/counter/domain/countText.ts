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
  // 区間ごとに数えて足す。つなげてから数えると、除外した文字の両側がくっつくことがある（🇯X🇵 の X を除くと 🇯🇵）
  applyCountRule(text, rule)
    .filter(({ counted }) => counted)
    .reduce((sum, { text }) => sum + countCharacters(text), 0);

/**
 * ルールに従って、元のテキストを「カウントする区間」と「カウントしない区間」に分ける。
 * 区間をすべてつなげると、元のテキストに戻る。隣り合う区間は、counted が必ず違う。
 *
 * 行・除外文字・空白・改行は、どれも元のテキストの上で探し、見つかった範囲をすべて合わせてカウントしない。
 * そのため、適用する順番で結果は変わらない。
 * 見た目の 1 文字（書記素）の途中で始まる・終わる一致は使わないので、区間は見た目の 1 文字の途中で切れない。
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
  const boundaries = graphemeBoundaries(text);
  const ignorePatterns = [
    ...(ignoreSpace ? [spaceRegex] : []),
    ...(ignoreLineBreak ? [/\n/g] : []),
  ];
  const ignoredRanges = [
    ...ignoredLineRanges(text, ignoreLinePrefixes, boundaries),
    ...ignoreStrings.flatMap((ignoreString) =>
      findStringRanges(text, ignoreString, boundaries),
    ),
    // 空白・改行は 1 単位ずつの一致なので、切れ目にない一致を捨てても、ほかの一致を見落とさない
    ...ignorePatterns
      .flatMap((regex) => matchRanges(text, regex))
      .filter(([start, end]) => boundaries[start] && boundaries[end]),
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
 * 先頭文字が、見た目の 1 文字の途中で終わる行は除外しない（先頭文字 👍 で、👍🏽 で始まる行など）。
 *
 * 隣の改行を含めるのは、行を取り除いて残りの行を改行でつないだときと、残る改行の数を同じにするため。
 * - 後ろに数える行が残っていれば、後ろの改行を含める
 * - 残っていなければ、前の改行を含める。最後の行には、後ろの改行がないことがあるため。
 *   テキストの先頭の行には前の改行もないので、行だけにする
 *
 * @param text 元のテキスト
 * @param linePrefixes この文字で始まる行を除外する
 * @param boundaries {@link graphemeBoundaries} で求めた、テキストの見た目の 1 文字の切れ目
 *
 * @example
 * ignoredLineRanges('a\n//b\nc', ['//'], boundaries) // => [[2, 6]]（'//b\n'）
 * ignoredLineRanges('a\n//b', ['//'], boundaries) // => [[1, 5]]（'\n//b'）
 * ignoredLineRanges('//a\n//b', ['//'], boundaries) // => [[0, 3], [3, 7]]（'//a' と '\n//b'）
 */
const ignoredLineRanges = (
  text: string,
  linePrefixes: readonly string[],
  boundaries: readonly boolean[],
): Range[] => {
  const prefixes = linePrefixes.map((prefix) =>
    prefix.replace(leadingSpaceRegex, ''),
  );
  const lines = text.split('\n');
  // 各行の先頭の位置。行と行のあいだには、改行が 1 つある
  const lineStarts: number[] = [];
  let lineStart = 0;
  for (const line of lines) {
    lineStarts.push(lineStart);
    lineStart += line.length + 1;
  }
  const isIgnoredLine = lines.map((line, i) => {
    const indent = line.length - line.replace(leadingSpaceRegex, '').length;
    return prefixes.some((prefix) =>
      matchesAt(text, prefix, lineStarts[i] + indent, boundaries),
    );
  });
  const lastCountedLine = isIgnoredLine.lastIndexOf(false);

  const ranges: Range[] = [];
  lines.forEach((line, i) => {
    const lineStart = lineStarts[i];
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
  });
  return ranges;
};

/**
 * 文字列を前から探し、見た目の 1 文字の切れ目で始まって切れ目で終わる範囲を、すべて返す。
 * 見つけた範囲どうしは重ねず、見つけた範囲の後ろから続きを探す。
 *
 * 一致を探してから切れ目にないものを捨てるのではなく、切れ目の位置ごとに調べる。
 * 捨てた一致の途中から始まる、正しい一致を見落とさないため。
 *
 * @param text 元のテキスト
 * @param string 探す文字列（空でない）
 * @param boundaries {@link graphemeBoundaries} で求めた、テキストの見た目の 1 文字の切れ目
 *
 * @example
 * findStringRanges('👍🏽👍', '👍', boundaries) // => [[4, 6]]（'👍🏽' の中の '👍' には一致しない）
 */
const findStringRanges = (
  text: string,
  string: string,
  boundaries: readonly boolean[],
): Range[] => {
  const ranges: Range[] = [];
  let start = 0;
  while (start < text.length) {
    if (matchesAt(text, string, start, boundaries)) {
      ranges.push([start, start + string.length]);
      start += string.length;
    } else {
      start++;
    }
  }
  return ranges;
};

/**
 * テキストの start の位置から文字列が始まり、その範囲が見た目の 1 文字の切れ目で始まって切れ目で終わるか。
 *
 * @param text 元のテキスト
 * @param string 探す文字列
 * @param start 調べる位置
 * @param boundaries {@link graphemeBoundaries} で求めた、テキストの見た目の 1 文字の切れ目
 *
 * @example
 * matchesAt('👍🏽', '👍', 0, boundaries) // => false（'👍' の後ろは切れ目ではない）
 */
const matchesAt = (
  text: string,
  string: string,
  start: number,
  boundaries: readonly boolean[],
) =>
  text.startsWith(string, start) &&
  boundaries[start] &&
  boundaries[start + string.length];

/**
 * 元のテキストの位置（UTF-16 の位置）ごとに、見た目の 1 文字の切れ目かを返す。
 * 長さはテキストより 1 つ長く、テキストの先頭と末尾も切れ目にする。
 *
 * @param text 元のテキスト
 *
 * @example
 * graphemeBoundaries('a👍🏽') // => [true, true, false, false, false, true]
 */
const graphemeBoundaries = (text: string) => {
  const boundaries = new Array<boolean>(text.length + 1).fill(false);
  for (const { index } of graphemeSegmenter.segment(text)) {
    boundaries[index] = true;
  }
  boundaries[text.length] = true;
  return boundaries;
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

// 改行以外の空白（半角・全角スペース、タブなど）
const spaceRegex = /[^\S\n]/g;
const leadingSpaceRegex = /^[^\S\n]+/;

const graphemeSegmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
