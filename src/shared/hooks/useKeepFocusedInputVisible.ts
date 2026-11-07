import { useEffect } from 'react';

/** キーボードの高さ（px）。index.css で、ページの下の余白にする */
export const KEYBOARD_INSET = '--keyboard-inset';

/** フォームとキーボードのあいだの間隔（px） */
const GAP = 8;

/** キーボードとブラウザのスクロールが落ち着くまで待つ時間（ms） */
export const SETTLE_DELAY = 300;

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
    let timer = 0;

    const scrollFocusedFormIntoView = () => {
      const input = document.activeElement;
      if (!(input instanceof HTMLInputElement)) return;
      const { bottom } = (input.form ?? input).getBoundingClientRect();
      const visibleBottom = viewport.offsetTop + viewport.height;
      if (bottom + GAP > visibleBottom) {
        window.scrollBy({
          top: bottom + GAP - visibleBottom,
          behavior: 'instant',
        });
      }
    };

    // キーボードが出る途中や、ブラウザが自分でスクロールしている途中に動かすと打ち消されるので、落ち着いてから確かめる
    const scheduleCheck = () => {
      clearTimeout(timer);
      timer = window.setTimeout(scrollFocusedFormIntoView, SETTLE_DELAY);
    };

    const handleResize = () => {
      // ピンチで拡大したときも見える範囲は狭くなるので、拡大の分は除く。
      // ページの高さごと縮むブラウザ（iPhone の Chrome など）では 0 になるが、そのときもスクロールは確かめる
      const inset = Math.max(
        0,
        Math.round(root.clientHeight - viewport.height * viewport.scale),
      );
      root.style.setProperty(KEYBOARD_INSET, `${inset}px`);
      scheduleCheck();
    };

    // キーボードが出たまま、別の入力欄に移ったとき
    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLInputElement) scheduleCheck();
    };

    viewport.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      viewport.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      clearTimeout(timer);
      root.style.removeProperty(KEYBOARD_INSET);
    };
  }, []);
};
