import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useAnimatedNumber } from './useAnimatedNumber';

// 動きは requestAnimationFrame と performance.now() で進むので、その2つの時計だけを偽物にして進める
beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const renderAnimatedNumber = (target: number, duration?: number) =>
  renderHook(
    (props?: { target: number }) =>
      useAnimatedNumber(props?.target ?? target, duration),
    { initialProps: { target } },
  );

describe('useAnimatedNumber', () => {
  it('時間がたつと、最後は目標の値になる', async () => {
    const { result, rerender, act } = await renderAnimatedNumber(0);
    expect(result.current).toBe(0);

    await rerender({ target: 100 });
    await act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);

    await act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(100);
  });

  it('動いている途中で目標が変わったら、表示中の値から続けて動く', async () => {
    // 1コマで進む量を小さくして、どこから動き始めたかを見分けやすくする
    const { result, rerender, act } = await renderAnimatedNumber(0, 3000);
    await rerender({ target: 1000 });
    await act(() => vi.advanceTimersByTime(1500));
    const shown = result.current;
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(1000);

    await rerender({ target: 2000 });
    await act(() => vi.advanceTimersByTime(16));
    // 前の目標（1000）や、前の動き始め（0）からではなく、表示中の値から少しだけ進んでいる
    expect(result.current).toBeGreaterThanOrEqual(shown);
    expect(result.current).toBeLessThan(1000);
  });

  it('OS で動きを減らす設定のときは、すぐに目標の値になる', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
        }) as MediaQueryList,
    );
    const { result, rerender } = await renderAnimatedNumber(0);

    await rerender({ target: 100 });
    expect(result.current).toBe(100);
  });

  it('部品が消えたら、予約したアニメーションを取り消す', async () => {
    const { rerender, unmount, act } = await renderAnimatedNumber(0);
    await rerender({ target: 100 });
    await act(() => vi.advanceTimersByTime(16));
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    await unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
