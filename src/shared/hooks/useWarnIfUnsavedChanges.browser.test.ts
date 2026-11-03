import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useWarnIfUnsavedChanges } from './useWarnIfUnsavedChanges';

// 本物の beforeunload はページを離れるときにしか起きないので、同じ名前のイベントを自分で送る。
// ブラウザは、beforeunload が preventDefault() されたときに確認を出す。
// 確認が本当に出ることは、E2E（ページを閉じるときの確認）で確かめている
const dispatchBeforeUnload = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
};

const renderWarnIfUnsavedChanges = (hasUnsavedChanges: boolean) =>
  renderHook(
    (props?: { hasUnsavedChanges: boolean }) =>
      useWarnIfUnsavedChanges(props?.hasUnsavedChanges ?? hasUnsavedChanges),
    { initialProps: { hasUnsavedChanges } },
  );

describe('useWarnIfUnsavedChanges', () => {
  it('未保存の入力があるときは、ページを離れる前に確認を出す', async () => {
    await renderWarnIfUnsavedChanges(true);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('未保存の入力がないときは、確認を出さない', async () => {
    await renderWarnIfUnsavedChanges(false);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('未保存の入力がなくなったら、確認を出さなくなる', async () => {
    const { rerender } = await renderWarnIfUnsavedChanges(true);
    await rerender({ hasUnsavedChanges: false });
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('部品が消えたら、beforeunload の登録を外す', async () => {
    const { unmount } = await renderWarnIfUnsavedChanges(true);
    await unmount();
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
