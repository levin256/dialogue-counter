import { describe, expect, it } from 'vitest';
import { displayWidth } from './displayWidth';

describe('displayWidth', () => {
  it('半角の英数字・記号は 1 として数える', () => {
    expect(displayWidth('//')).toBe(2);
    expect(displayWidth('a !')).toBe(3);
  });

  it('全角の文字は 2 として数える', () => {
    expect(displayWidth('、')).toBe(2);
    expect(displayWidth('！')).toBe(2);
    expect(displayWidth('※注')).toBe(4);
  });

  it('半角カタカナは 1 として数える', () => {
    expect(displayWidth('ｱｲ')).toBe(2);
  });

  it('全角と半角が混ざっていても、合わせて数える', () => {
    expect(displayWidth('// メモ')).toBe(7);
  });

  it('絵文字のようなサロゲートペアも、1文字（全角）として数える', () => {
    expect(displayWidth('😀')).toBe(2);
  });
});
