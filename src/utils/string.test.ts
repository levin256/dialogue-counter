import { describe, expect, it } from 'vitest';
import type { IgnoreLinePrefix, IgnoreString } from '../schemas';
import {
  countCharacters,
  excludeIgnoreString,
  onlyWhiteSpaceRegex,
} from './string';

const ignoreStrings = (...values: string[]): IgnoreString[] =>
  values.map((ignoreString, i) => ({ id: `s${i}`, ignoreString }));

const ignoreLinePrefixes = (...values: string[]): IgnoreLinePrefix[] =>
  values.map((ignoreLinePrefix, i) => ({ id: `p${i}`, ignoreLinePrefix }));

type Options = {
  strings?: string[];
  prefixes?: string[];
  ignoreSpace?: boolean;
  ignoreLineBreak?: boolean;
};

// 除外ルールを名前付きで渡せるようにするテスト用のラッパー
const exclude = (
  text: string,
  {
    strings = [],
    prefixes = [],
    ignoreSpace = false,
    ignoreLineBreak = false,
  }: Options = {},
) =>
  excludeIgnoreString(
    text,
    ignoreStrings(...strings),
    ignoreLinePrefixes(...prefixes),
    ignoreSpace,
    ignoreLineBreak,
  );

describe('excludeIgnoreString', () => {
  it('除外ルールがなければ、テキストをそのまま返す', () => {
    expect(exclude('こんにちは。\n元気？')).toBe('こんにちは。\n元気？');
  });

  describe('除外文字', () => {
    it('登録した文字をすべて取り除く', () => {
      expect(
        exclude('「はい。」「いいえ。」', { strings: ['「', '」', '。'] }),
      ).toBe('はいいいえ');
    });

    it('正規表現の特殊文字もそのままの文字として扱う', () => {
      expect(exclude('a.b*c(d)', { strings: ['.', '*', '(', ')'] })).toBe(
        'abcd',
      );
    });

    it('複数文字の除外文字は、その並びだけを取り除く', () => {
      expect(exclude('……と…', { strings: ['……'] })).toBe('と…');
    });
  });

  describe('空白', () => {
    it('ON のとき、半角・全角スペースを取り除く', () => {
      expect(exclude('a b\u3000c', { ignoreSpace: true })).toBe('abc');
    });

    it('OFF のとき、空白を残す', () => {
      expect(exclude('a b\u3000c')).toBe('a b\u3000c');
    });
  });

  describe('改行', () => {
    it('ON のとき、改行を取り除く', () => {
      expect(exclude('a\nb\n', { ignoreLineBreak: true })).toBe('ab');
    });

    it('OFF のとき、改行を残す', () => {
      expect(exclude('a\nb')).toBe('a\nb');
    });
  });

  describe('除外する行', () => {
    it('指定した文字で始まる行を、改行ごと取り除く', () => {
      expect(exclude('台詞1\n// メモ\n台詞2', { prefixes: ['//'] })).toBe(
        '台詞1\n台詞2',
      );
    });

    it('複数の指定があれば、どれかで始まる行を取り除く', () => {
      expect(exclude('a\n#b\n//c\nd', { prefixes: ['#', '//'] })).toBe('a\nd');
    });

    it('行の途中に指定した文字があっても、行は取り除かない', () => {
      expect(exclude('台詞 // メモ', { prefixes: ['//'] })).toBe(
        '台詞 // メモ',
      );
    });

    it('除外文字より先に適用される', () => {
      // 除外文字 '/' を先に消していたら、'//' で始まる行は見つからなくなる
      expect(exclude('a\n//b', { strings: ['/'], prefixes: ['//'] })).toBe('a');
    });
  });

  describe('空白（改行以外）', () => {
    it.each([
      ['タブ', 'a\tb'],
      ['ノーブレークスペース', 'a\u00a0b'],
    ])('ON のとき、%s も取り除く', (_, text) => {
      expect(exclude(text, { ignoreSpace: true })).toBe('ab');
    });

    it('ON でも、改行は残す（改行は別の設定で扱う）', () => {
      expect(exclude('a \nb', { ignoreSpace: true })).toBe('a\nb');
    });
  });

  describe('インデントされた行', () => {
    it('行頭の空白（半角・全角スペース、タブ）を読み飛ばして判定する', () => {
      expect(
        exclude('a\n  // b\n\u3000// c\n\t// d\ne', { prefixes: ['//'] }),
      ).toBe('a\ne');
    });

    it('先頭文字の側に空白があっても、同じように判定する', () => {
      expect(exclude('a\n// b', { prefixes: [' //'] })).toBe('a');
    });
  });

  describe('同じ除外文字が複数あるとき', () => {
    it('結果は 1 つのときと変わらない（重複の登録はフォームで弾く）', () => {
      expect(exclude('a。b', { strings: ['。', '。'] })).toBe('ab');
    });
  });

  describe('複数文字の除外文字', () => {
    it('登録順に適用するので、除外の結果として新しくできた並びも取り除かれる', () => {
      // 'b' を消すと 'ac' ができ、それも消える
      expect(exclude('abc', { strings: ['b', 'ac'] })).toBe('');
      // 登録順が逆だと、'ac' はまだないので残る
      expect(exclude('abc', { strings: ['ac', 'b'] })).toBe('ac');
    });
  });
});

describe('countCharacters', () => {
  it.each([
    ['ひらがな・漢字', 'あい漢字', 4],
    ['空文字', '', 0],
    ['絵文字', '😀', 1],
    ['サロゲートペアの漢字', '𠮷', 1],
    ['肌の色付きの絵文字', '👍🏽', 1],
    ['国旗', '🇯🇵', 1],
    ['ZWJ でつないだ絵文字', '👨‍👩‍👧', 1],
    ['結合文字の濁点', 'か\u3099', 1],
    ['異体字セレクタ付きの漢字', '葛\u{E0100}', 1],
  ])('見た目の 1 文字を 1 と数える: %s', (_, text, expected) => {
    expect(countCharacters(text)).toBe(expected);
  });

  it('改行も 1 文字と数える', () => {
    expect(countCharacters('a\nb')).toBe(3);
  });
});

describe('onlyWhiteSpaceRegex', () => {
  it.each([' ', '\u3000', '\t', ' \u3000\n'])(
    '空白だけの文字列 %j にマッチする',
    (value) => {
      expect(onlyWhiteSpaceRegex.test(value)).toBe(true);
    },
  );

  it.each(['a', ' a ', '。'])('空白以外を含む %j にはマッチしない', (value) => {
    expect(onlyWhiteSpaceRegex.test(value)).toBe(false);
  });

  it('文字列 "u3000" にはマッチしない', () => {
    expect(onlyWhiteSpaceRegex.test('u3000')).toBe(false);
  });
});
