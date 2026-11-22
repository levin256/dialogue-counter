import {
  findStringRanges,
  type GraphemeRange,
  type Graphemes,
  lineRanges,
  matchesAt,
  splitGraphemes,
} from '@/shared/lib/graphemes';
import type { CountRule } from './countRule';

// ルールに従って、テキストの文字数を数える。公開する関数を先に、中で使う部品を後ろに並べる。
// ここに書くのは、何をカウントしないかの仕様だけ。見た目の 1 文字に分ける・探すのは shared/lib/graphemes.ts。

/** 元のテキストの一部と、それをカウントするか。 */
export type CountSegment = {
  text: string;
  counted: boolean;
};

/**
 * テキストの文字数を、ルールに従って数える。見た目の 1 文字（書記素）を 1 と数えるので、絵文字や結合文字も 1 文字になる。
 * 数えない部分の両側の文字は、くっつけずに別々に数える（🇯X🇵 の X を除いても、🇯🇵 の国旗 1 文字にはしない）。
 *
 * @param text 数えるテキスト
 * @param rule 何をカウントしないか
 *
 * @example
 * countText('「はい。」', DEFAULT_COUNT_RULE) // => 2
 */
export const countText = (text: string, rule: CountRule) =>
  markGraphemes(text, rule).filter(({ counted }) => counted).length;

/**
 * ルールに従って、元のテキストを「カウントする区間」と「カウントしない区間」に分ける。
 * 区間をすべてつなげると、元のテキストに戻る。隣り合う区間は、counted が必ず違う。
 *
 * 行・除外文字・空白・改行は、どれも元のテキストの上で探し、見つかった範囲をすべて合わせてカウントしない。
 * そのため、適用する順番で結果は変わらない。
 * テキストを見た目の 1 文字（書記素）ずつに分けてから探すので、区間は見た目の 1 文字の途中で切れない。
 * 改行は `\n` だけの前提（textarea の値は `\n` にそろう）。`\r\n` は見た目の 1 文字になるので、改行として扱わない。
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
  rule: CountRule,
): CountSegment[] => {
  // カウントするかが同じ文字の並びを、1 つの区間にまとめる
  const segments: CountSegment[] = [];
  for (const grapheme of markGraphemes(text, rule)) {
    const lastSegment = segments.at(-1);
    if (lastSegment?.counted === grapheme.counted) {
      lastSegment.text += grapheme.text;
    } else {
      segments.push({ ...grapheme });
    }
  }
  return segments;
};

/** 見た目の 1 文字（書記素）と、それをカウントするか。 */
type Grapheme = {
  text: string;
  counted: boolean;
};

/**
 * ルールに従って、元のテキストを見た目の 1 文字ずつに分け、それぞれにカウントするかを付ける。
 * 1 文字ずつつなげると、元のテキストに戻る。
 *
 * @param text 元のテキスト
 * @param rule 何をカウントしないか
 *
 * @example
 * markGraphemes('「👍🏽」', DEFAULT_COUNT_RULE)
 * // => [{ text: '「', counted: false }, { text: '👍🏽', counted: true }, { text: '」', counted: false }]
 */
const markGraphemes = (
  text: string,
  {
    ignoreStrings,
    ignoreLinePrefixes,
    ignoreSpace,
    ignoreLineBreak,
  }: CountRule,
): Grapheme[] => {
  const graphemes = splitGraphemes(text);
  // 見た目の 1 文字ごとに、カウントしないか。空白・改行は、その 1 文字だけを見て決める
  const ignored = graphemes.map(
    (grapheme) =>
      (ignoreSpace && isSpace(grapheme)) ||
      (ignoreLineBreak && grapheme === '\n'),
  );
  // 行・除外文字は、複数の文字にまたがるので、範囲で決める
  const ignoredRanges = [
    ...ignoredLineRanges(graphemes, ignoreLinePrefixes),
    ...ignoreStrings.flatMap((ignoreString) =>
      findStringRanges(graphemes, ignoreString),
    ),
  ];
  for (const [start, end] of ignoredRanges) {
    ignored.fill(true, start, end);
  }
  return graphemes.map((grapheme, i) => ({
    text: grapheme,
    counted: !ignored[i],
  }));
};

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
 * @param graphemes 元のテキストを、見た目の 1 文字ずつに分けた配列
 * @param linePrefixes この文字で始まる行を除外する
 *
 * @example
 * ignoredLineRanges(splitGraphemes('a\n//b\nc'), ['//']) // => [[2, 6]]（'//b\n'）
 * ignoredLineRanges(splitGraphemes('a\n//b'), ['//']) // => [[1, 5]]（'\n//b'）
 * ignoredLineRanges(splitGraphemes('//a\n//b'), ['//']) // => [[0, 3], [3, 7]]（'//a' と '\n//b'）
 */
const ignoredLineRanges = (
  graphemes: Graphemes,
  linePrefixes: readonly string[],
): GraphemeRange[] => {
  const prefixes = linePrefixes.map((prefix) =>
    prefix.replace(leadingSpaceRegex, ''),
  );
  const lines = lineRanges(graphemes);
  const isIgnoredLine = lines.map(([lineStart, lineEnd]) => {
    // 行頭の空白の、次の位置
    let contentStart = lineStart;
    while (contentStart < lineEnd && isSpace(graphemes[contentStart])) {
      contentStart++;
    }
    return prefixes.some((prefix) =>
      matchesAt(graphemes, prefix, contentStart),
    );
  });
  const lastCountedLine = isIgnoredLine.lastIndexOf(false);

  // 行の範囲に改行は含まれない。lineEnd は、後ろに改行があれば、その改行の位置になる
  return lines.flatMap(([lineStart, lineEnd], i): GraphemeRange[] => {
    if (!isIgnoredLine[i]) {
      return [];
    }
    const hasCountedLineAfter = i < lastCountedLine;
    return [
      hasCountedLineAfter
        ? [lineStart, lineEnd + 1]
        : [Math.max(lineStart - 1, 0), lineEnd],
    ];
  });
};

/**
 * 見た目の 1 文字が、改行以外の空白（半角・全角スペース、タブなど）か。
 * 結合文字が付いて見た目の 1 文字になった空白は、空白として扱わない。
 */
const isSpace = (grapheme: string) => spaceRegex.test(grapheme);

// 改行以外の空白
const spaceRegex = /^[^\S\n]$/;
const leadingSpaceRegex = /^[^\S\n]+/;
