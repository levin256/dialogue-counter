import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('クラスを空白区切りでつなぐ', () => {
    expect(cn('flex', 'gap-2')).toBe('flex gap-2');
  });

  it('false・undefined・null は無視する', () => {
    expect(cn('flex', false, undefined, null, 'gap-2')).toBe('flex gap-2');
  });

  it('{ クラス: 条件 } は、条件が true のクラスだけを残す', () => {
    expect(cn({ 'bg-primary': true, 'bg-destructive': false })).toBe(
      'bg-primary',
    );
  });

  it('ぶつかるクラスは、あとに書いた方だけを残す', () => {
    expect(cn('px-2', 'px-3')).toBe('px-3');
    expect(cn('px-3', 'px-2')).toBe('px-2');
  });

  it('トークンの色どうしも、ぶつかるクラスとして扱う', () => {
    expect(cn('bg-primary', 'bg-destructive')).toBe('bg-destructive');
    expect(cn('text-foreground', 'text-muted-foreground')).toBe(
      'text-muted-foreground',
    );
  });

  it('文字の色と大きさは、ぶつからない', () => {
    expect(cn('text-sm', 'text-primary-foreground')).toBe(
      'text-sm text-primary-foreground',
    );
  });

  it('角丸の一部だけを上書きするクラスは、両方を残す', () => {
    expect(cn('rounded-md', 'rounded-l-none')).toBe(
      'rounded-md rounded-l-none',
    );
  });
});
