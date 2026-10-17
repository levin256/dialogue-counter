import { describe, expect, it } from 'vitest';
import type { IgnoreLinePrefix, IgnoreString } from '../schemas';
import { excludeIgnoreString, onlyWhiteSpaceRegex } from './string';

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
    it('ON のとき、半角スペースと全角スペースを取り除く', () => {
      expect(exclude('a b　c', { ignoreSpace: true })).toBe('abc');
    });

    it('OFF のとき、空白を残す', () => {
      expect(exclude('a b　c')).toBe('a b　c');
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

  // ここから下は、issue #2 の「論点」に対応する現状の挙動
  describe('現状の挙動（論点）', () => {
    it('カウントは UTF-16 単位なので、絵文字やサロゲートペアの漢字は 2 文字になる', () => {
      expect(exclude('😀').length).toBe(2);
      expect(exclude('𠮷').length).toBe(2);
      // 国旗や肌の色付きの絵文字は、さらに多くなる
      expect(exclude('👍🏽').length).toBe(4);
    });

    it('インデントされた行は、除外する行にならない', () => {
      expect(exclude('a\n  // メモ', { prefixes: ['//'] })).toBe(
        'a\n  // メモ',
      );
    });

    it('「空白をカウントしない」でも、タブは残る', () => {
      expect(exclude('a\tb', { ignoreSpace: true })).toBe('a\tb');
    });

    it('同じ除外文字を 2 回登録しても、結果は変わらない', () => {
      expect(exclude('a。b', { strings: ['。', '。'] })).toBe('ab');
    });

    it('除外を順番に適用するので、除外の結果として新しくできた並びも取り除かれる', () => {
      // 'b' を消すと 'ac' ができ、それも消える
      expect(exclude('abc', { strings: ['b', 'ac'] })).toBe('');
      // 登録順が逆だと、'ac' はまだないので残る
      expect(exclude('abc', { strings: ['ac', 'b'] })).toBe('ac');
    });
  });
});

describe('onlyWhiteSpaceRegex', () => {
  it.each([' ', '　', '\t', ' 　\n'])(
    '空白だけの文字列 %j にマッチする',
    (value) => {
      expect(onlyWhiteSpaceRegex.test(value)).toBe(true);
    },
  );

  it.each(['a', ' a ', '。'])('空白以外を含む %j にはマッチしない', (value) => {
    expect(onlyWhiteSpaceRegex.test(value)).toBe(false);
  });

  it('現状のバグ: 文字列 "u3000" にマッチしてしまう', () => {
    expect(onlyWhiteSpaceRegex.test('u3000')).toBe(true);
  });
});
