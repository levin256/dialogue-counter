import { useEffect } from 'react';

/** キーボードの高さ（px）。index.css で、ページの下の余白にする */
export const KEYBOARD_INSET = '--keyboard-inset';

/** フォームとキーボードのあいだの間隔（px） */
const GAP = 8;

/**
 * スマホでキーボードが出たとき、フォーカス中の1行の入力欄のフォーム（エラーの文を含む）が隠れていれば、見える位置までスクロールする。
 * いちばん下の入力欄はそれ以上スクロールできずに隠れるので、キーボードの高さだけページの下に余白を足す。
 * 複数行の入力欄は、動かすと打っている位置から離れるので、ブラウザに任せる。
 */
export const useKeepFocusedInputVisible = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    let frame = 0;

    const handleResize = () => {
      // ピンチで拡大したときも見える範囲は狭くなるので、拡大の分は除く
      const inset = Math.max(
        0,
        Math.round(root.clientHeight - viewport.height * viewport.scale),
      );
      root.style.setProperty(KEYBOARD_INSET, `${inset}px`);
      if (inset === 0) return;

      // 余白が付いてから測る
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const input = document.activeElement;
        if (!(input instanceof HTMLInputElement)) return;
        const { bottom } = (input.form ?? input).getBoundingClientRect();
        const visibleBottom = viewport.offsetTop + viewport.height;
        if (bottom + GAP > visibleBottom) {
          window.scrollBy({ top: bottom + GAP - visibleBottom });
        }
      });
    };

    viewport.addEventListener('resize', handleResize);
    return () => {
      viewport.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frame);
      root.style.removeProperty(KEYBOARD_INSET);
    };
  }, []);
};
