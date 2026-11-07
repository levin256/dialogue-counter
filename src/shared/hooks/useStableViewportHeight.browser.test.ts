import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { renderHook } from 'vitest-browser-react';
import {
  STABLE_VIEWPORT_HEIGHT,
  useStableViewportHeight,
} from './useStableViewportHeight';

const WIDTH = 400;
const HEIGHT = 800;

const stableHeight = () =>
  document.documentElement.style.getPropertyValue(STABLE_VIEWPORT_HEIGHT);

// resize が届くのを待つ
const waitForResize = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

afterEach(async () => {
  await page.viewport(WIDTH, HEIGHT);
});

// 本物のキーボードは出せないので、ビューポートの高さを変えて代わりにする
describe('useStableViewportHeight', () => {
  it('開いたときの画面の高さを、px で入れる', async () => {
    await page.viewport(WIDTH, HEIGHT);
    await renderHook(() => useStableViewportHeight());
    expect(stableHeight()).toBe(`${HEIGHT}px`);
  });

  it('高さだけが変わったときは、入れ直さない', async () => {
    await page.viewport(WIDTH, HEIGHT);
    await renderHook(() => useStableViewportHeight());

    await page.viewport(WIDTH, HEIGHT - 300);
    await waitForResize();
    expect(stableHeight()).toBe(`${HEIGHT}px`);
  });

  it('幅が変わったとき（画面の回転など）は、そのときの高さで入れ直す', async () => {
    await page.viewport(WIDTH, HEIGHT);
    await renderHook(() => useStableViewportHeight());

    await page.viewport(HEIGHT, WIDTH);
    await waitForResize();
    expect(stableHeight()).toBe(`${WIDTH}px`);
  });

  it('部品が消えたら、CSS 変数を外す', async () => {
    const { unmount } = await renderHook(() => useStableViewportHeight());
    await unmount();
    expect(stableHeight()).toBe('');
  });
});
