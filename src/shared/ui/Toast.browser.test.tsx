import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Toast } from './Toast';

// 閉じる時間は setTimeout で数えるので、その時計だけを偽物にして進める
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterEach(() => {
  vi.useRealTimers();
});

const renderToast = async (message: string) => {
  const onClose = vi.fn();
  const toast = (text: string) => (
    <>
      {/* トーストの外へフォーカスを移す先 */}
      <button type="button">ほかのボタン</button>
      <Toast
        message={text}
        actionLabel="元に戻す"
        onAction={() => {}}
        onClose={onClose}
      />
    </>
  );
  const screen = await render(toast(message));
  return {
    screen,
    onClose,
    rerender: (text: string) => screen.rerender(toast(text)),
  };
};

describe('Toast', () => {
  it('6 秒たつと閉じる', async () => {
    const { onClose } = await renderToast('「、」を削除しました');

    vi.advanceTimersByTime(5999);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('マウスが乗っているあいだは閉じず、離れてから 6 秒で閉じる', async () => {
    const { screen, onClose } = await renderToast('「、」を削除しました');

    await userEvent.hover(screen.getByText('「、」を削除しました'));
    vi.advanceTimersByTime(10000);
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.hover(screen.getByRole('button', { name: 'ほかのボタン' }));
    vi.advanceTimersByTime(6000);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('中にフォーカスがあるあいだは閉じず、外れてから 6 秒で閉じる', async () => {
    const { screen, onClose } = await renderToast('「、」を削除しました');
    const other = screen.getByRole('button', { name: 'ほかのボタン' });

    await userEvent.click(other);
    await userEvent.tab();
    await expect
      .element(screen.getByRole('button', { name: '元に戻す' }))
      .toHaveFocus();
    // マウスはトーストの外にあるので、止めているのはフォーカスだけ
    vi.advanceTimersByTime(10000);
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(other);
    vi.advanceTimersByTime(6000);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('文が変わったら、時間を最初から数え直す', async () => {
    const { onClose, rerender } = await renderToast('「、」を削除しました');
    vi.advanceTimersByTime(4000);

    await rerender('「。」を削除しました');
    vi.advanceTimersByTime(4000);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('文が null のあいだは、何も出さない', async () => {
    const screen = await render(
      <Toast
        message={null}
        actionLabel="元に戻す"
        onAction={() => {}}
        onClose={() => {}}
      />,
    );
    // 読み上げが変化を拾えるように、領域だけは置いておく
    await expect.element(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
