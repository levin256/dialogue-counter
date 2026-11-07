import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
  KEYBOARD_INSET,
  SETTLE_DELAY,
  useKeepFocusedInputVisible,
} from './useKeepFocusedInputVisible';

const WIDTH = 400;
const HEIGHT = 800;

// 本物のキーボードは出せないので、visualViewport を偽物にする
class FakeVisualViewport extends EventTarget {
  height = HEIGHT;
  offsetTop = 0;
  scale = 1;

  /** 見える範囲だけが狭くなる（iPhone の Safari など） */
  showKeyboard(height: number) {
    this.height = HEIGHT - height;
    this.dispatchEvent(new Event('resize'));
  }

  /** ページの高さごと縮む（iPhone の Chrome など） */
  async showKeyboardAndShrinkPage(height: number) {
    await page.viewport(WIDTH, HEIGHT - height);
    this.height = HEIGHT - height;
    this.dispatchEvent(new Event('resize'));
  }

  hideKeyboard() {
    this.height = HEIGHT;
    this.dispatchEvent(new Event('resize'));
  }
}

let viewport: FakeVisualViewport;
const original = Object.getOwnPropertyDescriptor(window, 'visualViewport');

beforeEach(async () => {
  await page.viewport(WIDTH, HEIGHT);
  viewport = new FakeVisualViewport();
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    get: () => viewport,
  });
  window.scrollTo(0, 0);
  // 落ち着くまで待つ時間だけを偽物にして進める
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterEach(async () => {
  vi.useRealTimers();
  if (original) Object.defineProperty(window, 'visualViewport', original);
  await page.viewport(WIDTH, HEIGHT);
});

const keyboardInset = () =>
  document.documentElement.style.getPropertyValue(KEYBOARD_INSET);

const visibleBottom = () => viewport.offsetTop + viewport.height;

/** 1行の入力欄が、画面のいちばん下に来るページ */
const Page = () => {
  useKeepFocusedInputVisible();
  return (
    <>
      <div style={{ height: HEIGHT - 60 }} />
      <form aria-label="追加">
        <input aria-label="1行" />
        <p style={{ height: 40 }}>エラーの文</p>
      </form>
      <textarea aria-label="複数行" />
      {/* スクロールできる分（実際のページでは index.css の余白で作る） */}
      <div style={{ height: 600 }} />
    </>
  );
};

const renderPage = async () => {
  const screen = await render(<Page />);
  const focus = (name: string) =>
    (screen.getByRole('textbox', { name }).element() as HTMLElement).focus({
      preventScroll: true,
    });
  const formBottom = () =>
    screen.getByRole('form', { name: '追加' }).element().getBoundingClientRect()
      .bottom;
  return { screen, focus, formBottom };
};

describe('useKeepFocusedInputVisible', () => {
  it('キーボードが出たら、その高さを CSS 変数に入れ、消えたら 0 に戻す', async () => {
    await renderPage();
    viewport.showKeyboard(300);
    expect(keyboardInset()).toBe('300px');

    viewport.hideKeyboard();
    expect(keyboardInset()).toBe('0px');
  });

  it('フォームが隠れたら、落ち着いてから、エラーの文まで見える位置にスクロールする', async () => {
    const { focus, formBottom } = await renderPage();
    focus('1行');
    vi.advanceTimersByTime(SETTLE_DELAY);
    const before = window.scrollY;
    viewport.showKeyboard(300);

    // 落ち着く前は動かさない（ブラウザのスクロールと打ち消し合わないように）
    expect(window.scrollY).toBe(before);
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(formBottom()).toBeLessThanOrEqual(visibleBottom());
  });

  it('ページの高さごと縮むブラウザでも、見える位置にスクロールする', async () => {
    const { focus, formBottom } = await renderPage();
    focus('1行');
    // フォーカスしたときの確かめは、キーボードが出る前に済ませておく
    vi.advanceTimersByTime(SETTLE_DELAY);
    await viewport.showKeyboardAndShrinkPage(300);
    expect(keyboardInset()).toBe('0px');

    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(formBottom()).toBeLessThanOrEqual(visibleBottom());
  });

  it('キーボードが出たまま1行の入力欄にフォーカスしたときも、見える位置にスクロールする', async () => {
    const { focus, formBottom } = await renderPage();
    focus('複数行');
    viewport.showKeyboard(300);
    vi.advanceTimersByTime(SETTLE_DELAY);

    focus('1行');
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(formBottom()).toBeLessThanOrEqual(visibleBottom());
  });

  it('複数行の入力欄にフォーカスしているときは、スクロールしない（ブラウザに任せる）', async () => {
    const { focus } = await renderPage();
    focus('複数行');

    viewport.showKeyboard(300);
    vi.advanceTimersByTime(SETTLE_DELAY);
    expect(window.scrollY).toBe(0);
  });

  it('部品が消えたら、CSS 変数を外す', async () => {
    const { screen } = await renderPage();
    viewport.showKeyboard(300);
    await screen.unmount();
    expect(keyboardInset()).toBe('');
  });
});
