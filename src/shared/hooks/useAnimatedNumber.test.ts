import { describe, expect, it } from 'vitest';
import { animatedValueAt } from './useAnimatedNumber';

describe('animatedValueAt', () => {
  it('進み具合が 0 なら元の値、1 なら目標の値になる', () => {
    expect(animatedValueAt(10, 110, 0)).toBe(10);
    expect(animatedValueAt(10, 110, 1)).toBe(110);
  });

  it('終わりに向けてゆっくりにするので、半分の時点で半分より先に進んでいる', () => {
    // 1 - (1 - 0.5)^3 = 0.875
    expect(animatedValueAt(0, 1000, 0.5)).toBe(875);
  });

  it('目標の値が小さくなるときは、減っていく', () => {
    expect(animatedValueAt(1000, 0, 0.5)).toBe(125);
  });

  it('文字数として出すので、整数に丸める', () => {
    expect(Number.isInteger(animatedValueAt(0, 7, 0.3))).toBe(true);
  });
});

// フック（useAnimatedNumber）そのものは、React を描く環境（Testing Library の renderHook と、
// ブラウザか jsdom）がないとテストできない。単体テストはブラウザのない Node で動かしていて、
// その環境はまだ入れていないので、入れるまで todo にしておく。
// 最後に目標の値で止まることは、E2E の文字数の表示（「文字数 6 文字」など）でも確かめている。
describe('useAnimatedNumber', () => {
  it.todo('時間がたつと、最後は目標の値になる');
  it.todo('動いている途中で目標が変わったら、表示中の値から続けて動く');
  it.todo('OS で動きを減らす設定のときは、すぐに目標の値になる');
  it.todo('部品が消えたら、予約したアニメーションを取り消す');
});
