import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  KEYBOARD_MIN_HEIGHT,
  SETTLE_DELAY,
  useRevealInputOnKeyboard,
} from './useRevealInputOnKeyboard';

// 本物のキーボードは出せないので、visualViewport を偽物にして、見えている範囲が縮んだことにする
class FakeVisualViewport extends EventTarget {
  height = document.documentElement.clientHeight;
  offsetTop = 0;
  scale = 1;

  /** 見えている範囲の下を、その高さだけ縮める（負の値なら広げる） */
  shrink(height: number) {
    this.height -= height;
    this.dispatchEvent(new Event('resize'));
  }
}

let viewport: FakeVisualViewport;
const original = Object.getOwnPropertyDescriptor(window, 'visualViewport');

beforeEach(() => {
  viewport = new FakeVisualViewport();
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    get: () => viewport,
  });
  window.scrollTo(0, 0);
});

afterEach(() => {
  vi.useRealTimers();
  if (original) Object.defineProperty(window, 'visualViewport', original);
});

const KEYBOARD_HEIGHT = 400;

/** 画面のいちばん下に、1行の入力欄のフォームを置き、その下に複数行の入力欄を置く */
const Page = () => {
  useRevealInputOnKeyboard();
  const screenHeight = document.documentElement.clientHeight;
  return (
    <>
      <div style={{ height: screenHeight - 80 }} />
      <form aria-label="追加">
        <input aria-label="1行" />
        <p style={{ height: 40, margin: 0 }}>エラーの文</p>
      </form>
      <textarea aria-label="複数行" />
      {/* キーボードが出ても、フォームまでスクロールできる分 */}
      <div style={{ height: 1000 }} />
    </>
  );
};

/** 描いてから、待ち時間を進められるようにする（描くまでは本物の時計を使う） */
const renderPage = async () => {
  const screen = await render(<Page />);
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  return {
    input: screen
      .getByRole('textbox', { name: '1行' })
      .element() as HTMLElement,
    textarea: screen
      .getByRole('textbox', { name: '複数行' })
      .element() as HTMLElement,
    form: screen.getByRole('form', { name: '追加' }).element(),
    unmount: screen.unmount,
  };
};

const visibleBottom = () => viewport.offsetTop + viewport.height;

describe('useRevealInputOnKeyboard', () => {
  it('キーボードが出たら、出きるのを待ってから、隠れたフォームをエラーの文まで見える位置にスクロールする', async () => {
    const { input, form } = await renderPage();
    input.focus();

    viewport.shrink(KEYBOARD_HEIGHT);
    vi.advanceTimersByTime(SETTLE_DELAY - 1);
    expect(window.scrollY).toBe(0);

    vi.advanceTimersByTime(1);
    expect(form.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      visibleBottom(),
    );
  });

  it('フォームが見えていれば、スクロールしない', async () => {
    const { input, form } = await renderPage();
    // フォームが画面の上のほうに来るまで、先にスクロールしておく
    window.scrollTo(0, form.getBoundingClientRect().top - 10);
    const before = window.scrollY;
    input.focus({ preventScroll: true });

    viewport.shrink(KEYBOARD_HEIGHT);
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(window.scrollY).toBe(before);
  });

  it('小さく縮んだとき（アドレスバーが出たとき）は、隠れていてもスクロールしない', async () => {
    const { input } = await renderPage();
    input.focus();

    viewport.shrink(KEYBOARD_MIN_HEIGHT);
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(window.scrollY).toBe(0);
  });

  it('キーボードを閉じたあとは、フォーカスが残っていても、入力欄の位置に引き戻さない', async () => {
    const { input } = await renderPage();
    input.focus();
    viewport.shrink(KEYBOARD_HEIGHT);
    vi.advanceTimersByTime(SETTLE_DELAY);

    // キーボードを閉じて上にスクロールし、アドレスバーが出て、フォームが隠れる
    viewport.shrink(-KEYBOARD_HEIGHT);
    window.scrollTo(0, 0);
    viewport.shrink(99);
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(window.scrollY).toBe(0);
  });

  it('ピンチで拡大して見えている範囲が縮んだときは、スクロールしない', async () => {
    const { input } = await renderPage();
    input.focus();

    viewport.scale = 2;
    viewport.shrink(viewport.height / 2);
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(window.scrollY).toBe(0);
  });

  it('複数行の入力欄にフォーカスしているときは、スクロールしない（ブラウザに任せる）', async () => {
    const { textarea } = await renderPage();
    textarea.focus({ preventScroll: true });

    viewport.shrink(KEYBOARD_HEIGHT);
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(window.scrollY).toBe(0);
  });

  it('部品が消えたら、resize の登録を外す', async () => {
    const { unmount } = await renderPage();
    const removeEventListener = vi.spyOn(viewport, 'removeEventListener');
    await unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
  });
});
