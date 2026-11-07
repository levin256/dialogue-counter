import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  KEYBOARD_INSET,
  useKeepFocusedInputVisible,
} from './useKeepFocusedInputVisible';

// 本物のキーボードは出せないので、visualViewport を偽物にする
class FakeVisualViewport extends EventTarget {
  height = document.documentElement.clientHeight;
  offsetTop = 0;
  scale = 1;

  showKeyboard(height: number) {
    this.height = document.documentElement.clientHeight - height;
    this.dispatchEvent(new Event('resize'));
  }

  hideKeyboard() {
    this.height = document.documentElement.clientHeight;
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
  if (original) Object.defineProperty(window, 'visualViewport', original);
});

const keyboardInset = () =>
  document.documentElement.style.getPropertyValue(KEYBOARD_INSET);

// フックは次の描画でスクロールするので、描画を2回分待つ
const waitForScroll = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );

const visibleBottom = () => viewport.offsetTop + viewport.height;

/** 1行の入力欄が、画面のいちばん下に来るページ */
const Page = () => {
  useKeepFocusedInputVisible();
  const below = document.documentElement.clientHeight;
  return (
    <>
      <div style={{ height: below - 60 }} />
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

describe('useKeepFocusedInputVisible', () => {
  it('キーボードが出たら、その高さを CSS 変数に入れ、消えたら 0 に戻す', async () => {
    await render(<Page />);
    viewport.showKeyboard(300);
    expect(keyboardInset()).toBe('300px');

    viewport.hideKeyboard();
    expect(keyboardInset()).toBe('0px');
  });

  it('フォーカス中の1行の入力欄のフォームが隠れたら、エラーの文まで見える位置にスクロールする', async () => {
    const screen = await render(<Page />);
    const input = screen.getByRole('textbox', { name: '1行' });
    (input.element() as HTMLInputElement).focus();

    viewport.showKeyboard(300);
    await waitForScroll();

    const form = screen.getByRole('form', { name: '追加' }).element();
    expect(form.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      visibleBottom(),
    );
  });

  it('複数行の入力欄にフォーカスしているときは、スクロールしない（ブラウザに任せる）', async () => {
    const screen = await render(<Page />);
    (
      screen.getByRole('textbox', { name: '複数行' }).element() as HTMLElement
    ).focus({ preventScroll: true });
    const before = window.scrollY;

    viewport.showKeyboard(300);
    await waitForScroll();
    expect(window.scrollY).toBe(before);
  });

  it('部品が消えたら、CSS 変数を外す', async () => {
    const screen = await render(<Page />);
    viewport.showKeyboard(300);
    await screen.unmount();
    expect(keyboardInset()).toBe('');
  });
});
