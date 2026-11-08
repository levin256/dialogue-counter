import { describe, expect, it } from 'vitest';
import { type CountRule, DEFAULT_COUNT_RULE, RuleValue } from './countRule';
import { applyCountRule, countCharacters, countText } from './countText';

type Overrides = {
  ignoreStrings?: string[];
  ignoreLinePrefixes?: string[];
  ignoreSpace?: boolean;
  ignoreLineBreak?: boolean;
};

const toRuleValues = (values: string[] = []) =>
  values.map((value) => RuleValue.parse(value));

// 指定しなかった項目は「除外しない」にしたルール
const toRule = ({
  ignoreStrings,
  ignoreLinePrefixes,
  ...flags
}: Overrides = {}): CountRule => ({
  ignoreStrings: toRuleValues(ignoreStrings),
  ignoreLinePrefixes: toRuleValues(ignoreLinePrefixes),
  ignoreSpace: false,
  ignoreLineBreak: false,
  ...flags,
});

// ルールを適用し、区間を 1 つの文字列に戻す。カウントしない区間は [ ] で囲む（例: '[「]はい[。」]'）
const exclude = (text: string, overrides?: Overrides) =>
  applyCountRule(text, toRule(overrides))
    .map(({ text, counted }) => (counted ? text : `[${text}]`))
    .join('');

describe('countText', () => {
  it('ルールを適用したあとの文字数を返す', () => {
    expect(
      countText('「はい。」\n// メモ\n😀', {
        ignoreStrings: toRuleValues(['「', '」', '。']),
        ignoreLinePrefixes: toRuleValues(['//']),
        ignoreSpace: true,
        ignoreLineBreak: true,
      }),
    ).toBe(3);
  });

  it('カウントする区間ごとに数えて足す', () => {
    // つなげてから数えると、'🇯🇵' が国旗 1 文字になって 1 になる
    expect(countText('🇯X🇵', toRule({ ignoreStrings: ['X'] }))).toBe(2);
  });

  it.each([
    ['👍', '👍🏽'],
    ['か', 'か\u3099'],
    ['👨', '👨‍👩‍👧'],
  ])(
    '除外文字 %j は、%j の一部に一致しない。見た目の 1 文字として数える',
    (ignoreString, text) => {
      expect(countText(text, toRule({ ignoreStrings: [ignoreString] }))).toBe(
        1,
      );
    },
  );

  it.each([
    ['「はい。」 そうです\n// メモ', 6],
    ['太郎「おはよう！」\n  // 小声で\n花子「……おはよう？」\n', 12],
    ['👍🏽「が」', 2],
    ['//a\n//b', 0],
    ['a\n\n　b\t c', 3],
    ['', 0],
  ])(
    '既定のルールでは、区間に分ける前の実装と同じ文字数になる: %j',
    (text, expected) => {
      // 期待値は、元のテキストから順に取り除いていた前の実装で数えたもの
      expect(countText(text, DEFAULT_COUNT_RULE)).toBe(expected);
    },
  );
});

describe('applyCountRule', () => {
  it('元のテキストを、カウントする区間とカウントしない区間に分けた配列を返す', () => {
    expect(
      applyCountRule(
        '「はい。」',
        toRule({ ignoreStrings: ['「', '」', '。'] }),
      ),
    ).toEqual([
      { text: '「', counted: false },
      { text: 'はい', counted: true },
      { text: '。」', counted: false },
    ]);
  });

  it('空のテキストは、区間のない配列を返す', () => {
    expect(applyCountRule('', toRule())).toEqual([]);
  });

  it('除外ルールがなければ、テキスト全体を 1 つのカウントする区間にする', () => {
    expect(exclude('こんにちは。\n元気？')).toBe('こんにちは。\n元気？');
  });

  describe('除外文字', () => {
    it('登録した文字をすべて除外する', () => {
      expect(
        exclude('「はい。」「いいえ。」', {
          ignoreStrings: ['「', '」', '。'],
        }),
      ).toBe('[「]はい[。」「]いいえ[。」]');
    });

    it('正規表現の特殊文字もそのままの文字として扱う', () => {
      expect(exclude('a.b*c(d)', { ignoreStrings: ['.', '*', '(', ')'] })).toBe(
        'a[.]b[*]c[(]d[)]',
      );
    });

    it('複数文字の除外文字は、その並びだけを除外する', () => {
      expect(exclude('……と…', { ignoreStrings: ['……'] })).toBe('[……]と…');
    });
  });

  describe('見た目の 1 文字（書記素）の途中', () => {
    it.each([
      ['肌の色付きの絵文字', '👍', '👍🏽'],
      ['結合文字の濁点', 'か', 'か\u3099'],
      ['ZWJ でつないだ絵文字', '👨', '👨‍👩‍👧'],
      ['国旗の組み合わせの途中', '🇵🇺', '🇯🇵🇺🇸'],
      // 肌の色の修飾子は、前の文字が何でもくっつく
      ['修飾子が後ろに付いた文字', 'X', '👍X🏽'],
    ])(
      'で始まる・終わる除外文字には一致しない: %s',
      (_, ignoreString, text) => {
        expect(exclude(text, { ignoreStrings: [ignoreString] })).toBe(text);
      },
    );

    it('見た目の 1 文字の切れ目で始まって切れ目で終わる除外文字は、除外する', () => {
      expect(exclude('a👍🏽b🇯🇵🇺🇸', { ignoreStrings: ['👍🏽', '🇺🇸'] })).toBe(
        'a[👍🏽]b🇯🇵[🇺🇸]',
      );
    });

    it('途中で終わる一致があっても、その中から始まる一致を見落とさない', () => {
      // 'か゛か' は 0〜3 にもあるが、3 は 2 つ目の 'が' の途中。2〜5 は切れ目で始まって切れ目で終わる
      expect(
        exclude('か\u3099か\u3099か', { ignoreStrings: ['か\u3099か'] }),
      ).toBe('か\u3099[か\u3099か]');
    });

    it('先頭文字が見た目の 1 文字の途中で終わる行は、除外しない', () => {
      expect(
        exclude('👍🏽 a\n👍 b\n  👍🏽 c', { ignoreLinePrefixes: ['👍'] }),
      ).toBe('👍🏽 a\n[👍 b\n]  👍🏽 c');
    });

    it('見た目の 1 文字の一部になっている空白は、除外しない', () => {
      // スペースの後ろに結合文字（アクセント記号）が付くと、見た目の 1 文字になる
      expect(exclude('a \u0301b c', { ignoreSpace: true })).toBe(
        'a \u0301b[ ]c',
      );
    });
  });

  describe('空白', () => {
    it('ON のとき、半角・全角スペースを除外する', () => {
      expect(exclude('a b　c', { ignoreSpace: true })).toBe('a[ ]b[　]c');
    });

    it('OFF のとき、空白を残す', () => {
      expect(exclude('a b　c')).toBe('a b　c');
    });
  });

  describe('改行', () => {
    it('ON のとき、改行を除外する', () => {
      expect(exclude('a\nb\n', { ignoreLineBreak: true })).toBe('a[\n]b[\n]');
    });

    it('OFF のとき、改行を残す', () => {
      expect(exclude('a\nb')).toBe('a\nb');
    });
  });

  describe('除外する行', () => {
    it('指定した文字で始まる行を、後ろの改行ごと除外する', () => {
      expect(
        exclude('台詞1\n// メモ\n台詞2', { ignoreLinePrefixes: ['//'] }),
      ).toBe('台詞1\n[// メモ\n]台詞2');
    });

    it('複数の指定があれば、どれかで始まる行を除外する', () => {
      expect(
        exclude('a\n#b\n//c\nd', { ignoreLinePrefixes: ['#', '//'] }),
      ).toBe('a\n[#b\n//c\n]d');
    });

    it('行の途中に指定した文字があっても、行は除外しない', () => {
      expect(exclude('台詞 // メモ', { ignoreLinePrefixes: ['//'] })).toBe(
        '台詞 // メモ',
      );
    });

    it.each([
      ['最後の行', 'a\n//b', 'a[\n//b]'],
      ['最後から続く行', 'a\n//b\n//c', 'a[\n//b\n//c]'],
      ['すべての行', '//a\n//b', '[//a\n//b]'],
    ])(
      '%sを除外するときは、後ろに残る行がないので、前の改行ごと除外する',
      (_, text, expected) => {
        // 行を取り除いたときと同じく、残る行のあいだの改行だけが残る
        expect(exclude(text, { ignoreLinePrefixes: ['//'] })).toBe(expected);
      },
    );

    it('除外文字を除外する前のテキストで判定する', () => {
      // 除外文字 '/' を先に除いていたら、'//' で始まる行は見つからなくなる
      expect(
        exclude('a\n//b', { ignoreStrings: ['/'], ignoreLinePrefixes: ['//'] }),
      ).toBe('a[\n//b]');
    });
  });

  describe('空白（改行以外）', () => {
    it.each([
      ['タブ', 'a\tb', 'a[\t]b'],
      ['ノーブレークスペース', 'a b', 'a[ ]b'],
    ])('ON のとき、%s も除外する', (_, text, expected) => {
      expect(exclude(text, { ignoreSpace: true })).toBe(expected);
    });

    it('ON でも、改行は残す（改行は別の設定で扱う）', () => {
      expect(exclude('a \nb', { ignoreSpace: true })).toBe('a[ ]\nb');
    });
  });

  describe('インデントされた行', () => {
    it('行頭の空白（半角・全角スペース、タブ）を読み飛ばして判定する', () => {
      expect(
        exclude('a\n  // b\n　// c\n\t// d\ne', {
          ignoreLinePrefixes: ['//'],
        }),
      ).toBe('a\n[  // b\n　// c\n\t// d\n]e');
    });

    it('先頭文字の側に空白があっても、同じように判定する', () => {
      expect(exclude('a\n// b', { ignoreLinePrefixes: [' //'] })).toBe(
        'a[\n// b]',
      );
    });
  });

  describe('同じ除外文字が複数あるとき', () => {
    it('結果は 1 つのときと変わらない（重複の登録はフォームで弾く）', () => {
      expect(exclude('a。b', { ignoreStrings: ['。', '。'] })).toBe('a[。]b');
    });
  });

  describe('複数文字の除外文字', () => {
    it('除外した結果くっついてできた並びは、除外しない', () => {
      // 'X' を除くと 'ab' ができるが、元のテキストに 'ab' はない
      expect(exclude('aXb', { ignoreStrings: ['X', 'ab'] })).toBe('a[X]b');
    });

    it('別の除外文字と重なる範囲も、除外する', () => {
      expect(exclude('abc', { ignoreStrings: ['ab', 'bc'] })).toBe('[abc]');
    });

    it('登録順を入れ替えても、結果は変わらない', () => {
      expect(exclude('abc', { ignoreStrings: ['b', 'ac'] })).toBe('a[b]c');
      expect(exclude('abc', { ignoreStrings: ['ac', 'b'] })).toBe('a[b]c');
    });

    it('同じ除外文字どうしは重ねずに、前から探す', () => {
      expect(exclude('aaa', { ignoreStrings: ['aa'] })).toBe('[aa]a');
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
