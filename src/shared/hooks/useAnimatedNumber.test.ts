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

  it('進み具合がマイナスなら、元の値になる', () => {
    // toBe は -0 と 0 を見分けるので、「-0」と表示される値も見つけられる
    expect(animatedValueAt(0, 5, -0.01)).toBe(0);
    expect(animatedValueAt(0, 3000, -0.05)).toBe(0);
    expect(animatedValueAt(100, 0, -0.05)).toBe(100);
  });

  it('進み具合が 1 を超えたら、目標の値になる', () => {
    expect(animatedValueAt(0, 100, 1.5)).toBe(100);
  });

  it('文字数として出すので、整数に丸める', () => {
    expect(Number.isInteger(animatedValueAt(0, 7, 0.3))).toBe(true);
  });
});

// フック（useAnimatedNumber）そのものは、React で描く必要があるので、useAnimatedNumber.browser.test.ts でブラウザで確かめる
