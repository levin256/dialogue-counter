import { describe, expect, it } from 'vitest';
import {
  findStringRanges,
  lineRanges,
  matchesAt,
  splitGraphemes,
} from './graphemes';

describe('splitGraphemes', () => {
  it('テキストを、見た目の 1 文字ずつに分ける', () => {
    expect(splitGraphemes('aあ👍🏽🇯🇵👨‍👩‍👧か\u3099')).toEqual([
      'a',
      'あ',
      '👍🏽',
      '🇯🇵',
      '👨‍👩‍👧',
      'か\u3099',
    ]);
  });

  it('空のテキストは、空の配列にする', () => {
    expect(splitGraphemes('')).toEqual([]);
  });

  it('つなげると、元のテキストに戻る', () => {
    const text = '太郎「👍🏽」\n  // メモ\n';
    expect(splitGraphemes(text).join('')).toBe(text);
  });

  it('改行は 1 文字にする。\\r\\n は合わせて 1 文字にする', () => {
    expect(splitGraphemes('a\nb\r\nc')).toEqual(['a', '\n', 'b', '\r\n', 'c']);
  });
});

describe('matchesAt', () => {
  it('その位置から文字列が並んでいれば、true を返す', () => {
    expect(matchesAt(splitGraphemes('abc'), 'b', 1)).toBe(true);
  });

  it('複数の文字にまたがる文字列も、調べられる', () => {
    expect(matchesAt(splitGraphemes('a👍🏽bc'), '👍🏽b', 1)).toBe(true);
  });

  it('文字列が別の位置から並んでいても、その位置からでなければ false を返す', () => {
    expect(matchesAt(splitGraphemes('abc'), 'b', 0)).toBe(false);
    expect(matchesAt(splitGraphemes('abc'), 'b', 2)).toBe(false);
  });

  it('見た目の 1 文字の途中で終わる文字列には、一致しない', () => {
    expect(matchesAt(splitGraphemes('👍🏽'), '👍', 0)).toBe(false);
  });

  it('配列の終わりまでに並びきらない文字列には、一致しない', () => {
    expect(matchesAt(splitGraphemes('ab'), 'bc', 1)).toBe(false);
  });

  it('配列の最後の文字にも、一致する', () => {
    expect(matchesAt(splitGraphemes('ab'), 'b', 1)).toBe(true);
  });

  it.each([
    ['配列の終わり', 1],
    ['配列の終わりより後ろ', 2],
    ['負の数', -1],
  ])('配列の外の位置には、一致しない: %s', (_, index) => {
    expect(matchesAt(splitGraphemes('a'), 'a', index)).toBe(false);
  });

  it('空文字は、どこにも一致しない', () => {
    expect(matchesAt(splitGraphemes('a'), '', 0)).toBe(false);
  });
});

describe('findStringRanges', () => {
  it('一致する範囲を、前からすべて返す', () => {
    expect(findStringRanges(splitGraphemes('a。b。'), '。')).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('範囲は、UTF-16 の位置ではなく、見た目の 1 文字の配列の番号で表す', () => {
    // '👍🏽' は UTF-16 では 4 単位あるが、見た目の 1 文字なので 1 と数える
    expect(findStringRanges(splitGraphemes('👍🏽a👍🏽a'), 'a')).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('複数の文字にまたがる文字列は、またがる範囲を返す', () => {
    expect(findStringRanges(splitGraphemes('……と…'), '……')).toEqual([[0, 2]]);
  });

  it('配列の先頭と末尾の一致も見つける', () => {
    expect(findStringRanges(splitGraphemes('「はい」'), '「')).toEqual([
      [0, 1],
    ]);
    expect(findStringRanges(splitGraphemes('「はい」'), '」')).toEqual([
      [3, 4],
    ]);
    expect(findStringRanges(splitGraphemes('はい'), 'はい')).toEqual([[0, 2]]);
  });

  it('見つからなければ、空の配列を返す', () => {
    expect(findStringRanges(splitGraphemes('abc'), 'x')).toEqual([]);
    expect(findStringRanges([], 'x')).toEqual([]);
  });

  it.each([
    ['肌の色付きの絵文字', '👍', '👍🏽'],
    ['結合文字の濁点', 'か', 'か\u3099'],
    ['ZWJ でつないだ絵文字', '👨', '👨‍👩‍👧'],
    ['国旗の組み合わせの途中', '🇵🇺', '🇯🇵🇺🇸'],
    // 肌の色の修飾子は、前の文字が何でもくっつく
    ['修飾子が後ろに付いた文字', 'X', '👍X🏽'],
    // ここから下は、1 文字の途中から始まり、次の文字の終わりまで続く
    ['修飾子と、次の文字', '🏽X', '👍🏽X'],
    ['結合文字の濁点と、次の文字', '\u3099か', 'か\u3099か'],
  ])(
    '見た目の 1 文字の途中で始まる・終わる文字列には、一致しない: %s',
    (_, string, text) => {
      expect(findStringRanges(splitGraphemes(text), string)).toEqual([]);
    },
  );

  it('見た目の 1 文字の切れ目で始まって切れ目で終わる文字列には、一致する', () => {
    // 見た目  a  👍🏽  b  🇯🇵  🇺🇸
    // 位置    0  1    2  3    4
    const graphemes = splitGraphemes('a👍🏽b🇯🇵🇺🇸');
    expect(findStringRanges(graphemes, '👍🏽')).toEqual([[1, 2]]);
    expect(findStringRanges(graphemes, '🇺🇸')).toEqual([[4, 5]]);
  });

  it('途中で終わる一致があっても、その中から始まる一致を見落とさない', () => {
    // 見た目  が       が       か
    // 位置    0        1        2
    // 中身    か 濁点  か 濁点  か
    // 「がか」は位置 0 の が から「か 濁点 か」と並ぶが、最後の か は位置 1 の が の途中なので使わない。
    // 位置 1 から探し直して、[1, 3] で見つける
    expect(
      findStringRanges(splitGraphemes('か\u3099か\u3099か'), 'か\u3099か'),
    ).toEqual([[1, 3]]);
  });

  it('見つけた範囲どうしは重ねずに、見つけた範囲の後ろから続きを探す', () => {
    expect(findStringRanges(splitGraphemes('aaa'), 'aa')).toEqual([[0, 2]]);
    expect(findStringRanges(splitGraphemes('aaaa'), 'aa')).toEqual([
      [0, 2],
      [2, 4],
    ]);
  });

  it('空文字は、どこにも一致しない', () => {
    expect(findStringRanges(splitGraphemes('abc'), '')).toEqual([]);
  });
});

describe('lineRanges', () => {
  it('改行で行に分け、各行の範囲を返す。範囲に改行は含まない', () => {
    // 見た目  a  \n  /  /  b  \n  c
    // 位置    0  1   2  3  4  5   6
    expect(lineRanges(splitGraphemes('a\n//b\nc'))).toEqual([
      [0, 1],
      [2, 5],
      [6, 7],
    ]);
  });

  it('範囲は、UTF-16 の位置ではなく、見た目の 1 文字の配列の番号で表す', () => {
    expect(lineRanges(splitGraphemes('👍🏽\n👍🏽'))).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });

  it('改行がなければ、全体を 1 行にする', () => {
    expect(lineRanges(splitGraphemes('abc'))).toEqual([[0, 3]]);
  });

  it('空の配列は、空の 1 行にする', () => {
    expect(lineRanges([])).toEqual([[0, 0]]);
  });

  it('改行が続くところと、改行で終わるところは、空の行にする', () => {
    expect(lineRanges(splitGraphemes('a\n\nb\n'))).toEqual([
      [0, 1],
      [2, 2],
      [3, 4],
      [5, 5],
    ]);
  });

  it('\\r\\n は見た目の 1 文字なので、改行として扱わない', () => {
    expect(lineRanges(splitGraphemes('a\r\nb'))).toEqual([[0, 3]]);
  });
});
