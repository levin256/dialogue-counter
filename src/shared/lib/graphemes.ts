// テキストを見た目の 1 文字（書記素）の配列にして扱う。位置はどれも、配列の番号（見た目の何文字目か）で表す。
// 1 文字の途中を指す番号がないので、1 文字の途中で始まる・終わる一致や範囲は、作れない。

/** 見た目の 1 文字の配列の範囲。start 文字目から、end 文字目の手前まで。 */
export type GraphemeRange = [start: number, end: number];

/**
 * テキストを、見た目の 1 文字（書記素）ずつに分ける。つなげると、元のテキストに戻る。
 *
 * @param text 分けるテキスト
 *
 * @example
 * splitGraphemes('a👍🏽b') // => ['a', '👍🏽', 'b']
 */
export const splitGraphemes = (text: string) =>
  Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);

/**
 * index 文字目から文字列が並び、見た目の 1 文字の切れ目で終わるか。
 * 空文字は、どこにも一致しない。配列の外の index も、一致しない。
 *
 * @param graphemes {@link splitGraphemes} で分けた、見た目の 1 文字の配列
 * @param string 探す文字列
 * @param index 調べる位置
 *
 * @example
 * matchesAt(['a', '👍🏽'], '👍🏽', 1) // => true
 * matchesAt(['a', '👍🏽'], '👍', 1) // => false（'👍' は '👍🏽' の途中で終わる）
 */
export const matchesAt = (
  graphemes: readonly string[],
  string: string,
  index: number,
) => matchEnd(graphemes, string, index) !== undefined;

/**
 * 文字列を前から探し、見た目の 1 文字の切れ目で始まって切れ目で終わる範囲を、すべて返す。
 * 見つけた範囲どうしは重ねず、見つけた範囲の後ろから続きを探す。空文字は、どこにも一致しない。
 *
 * @param graphemes {@link splitGraphemes} で分けた、見た目の 1 文字の配列
 * @param string 探す文字列
 *
 * @example
 * findStringRanges(['👍🏽', '👍'], '👍') // => [[1, 2]]（'👍🏽' の中の '👍' には一致しない）
 */
export const findStringRanges = (
  graphemes: readonly string[],
  string: string,
): GraphemeRange[] => {
  const ranges: GraphemeRange[] = [];
  let start = 0;
  while (start < graphemes.length) {
    const end = matchEnd(graphemes, string, start);
    if (end === undefined) {
      start++;
    } else {
      ranges.push([start, end]);
      start = end;
    }
  }
  return ranges;
};

/**
 * 改行（`\n`）で行に分け、各行の範囲を返す。範囲に改行は含まない。
 * `\r\n` は見た目の 1 文字になるので、改行として扱わない。
 *
 * @param graphemes {@link splitGraphemes} で分けた、見た目の 1 文字の配列
 *
 * @example
 * lineRanges(['a', '\n', 'b', 'c']) // => [[0, 1], [2, 4]]
 */
export const lineRanges = (graphemes: readonly string[]): GraphemeRange[] => {
  const ranges: GraphemeRange[] = [];
  let start = 0;
  graphemes.forEach((grapheme, i) => {
    if (grapheme === '\n') {
      ranges.push([start, i]);
      start = i + 1;
    }
  });
  ranges.push([start, graphemes.length]);
  return ranges;
};

/** index 文字目から文字列が並び、見た目の 1 文字の切れ目で終わるなら、終わりの位置を返す。 */
const matchEnd = (
  graphemes: readonly string[],
  string: string,
  index: number,
) => {
  if (string === '' || index < 0) {
    return undefined;
  }
  // string のうち、ここまでに並んだ長さ
  let matchedLength = 0;
  for (let end = index; end < graphemes.length; end++) {
    if (!string.startsWith(graphemes[end], matchedLength)) {
      return undefined;
    }
    matchedLength += graphemes[end].length;
    if (matchedLength === string.length) {
      return end + 1;
    }
  }
  return undefined;
};

const graphemeSegmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
