import { useEffect } from 'react';

/**
 * 一度にこれより大きく縮んだら、キーボードが出たとみなす（px）。
 * アドレスバーの出入りは、iPhone の Chrome で合計 99px なので、それより大きくする
 */
export const KEYBOARD_MIN_HEIGHT = 150;

/** キーボードが出きるまで待つ時間（ms）。途中で動かすと、ページが縮みきる前の位置で測ってしまう */
export const SETTLE_DELAY = 300;

/** フォームとキーボードのあいだの間隔（px） */
const GAP = 8;

/**
 * キーボードが出たとき、フォーカス中の1行の入力欄のフォームが隠れていれば、見える位置までスクロールする。
 *
 * iPhone の Chrome は、フォーカスしたあとにページの高さごと縮めるので、ブラウザが見せた位置のまま隠れることがある（#28）。
 * キーボードを閉じてもフォーカスは残るので、高さが変わるたびではなく、大きく縮んだときだけ動かす。
 * 複数行の入力欄は、欄の下端に合わせると打っている位置から離れるので、ブラウザに任せる。
 */
export const useRevealInputOnKeyboard = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    // ピンチで拡大しても見えている範囲は縮むので、拡大の分を戻した高さで比べる
    const unscaledHeight = () => viewport.height * viewport.scale;
    let lastHeight = unscaledHeight();
    let timer = 0;

    const revealFocusedInput = () => {
      const input = document.activeElement;
      if (!(input instanceof HTMLInputElement)) return;
      // エラーの文が出ていれば、それも見せる
      const { bottom } = (input.form ?? input).getBoundingClientRect();
      const visibleBottom = viewport.offsetTop + viewport.height;
      if (bottom + GAP > visibleBottom) {
        // 'instant' にしないと、index.css のなめらかなスクロールになる
        window.scrollBy({
          top: bottom + GAP - visibleBottom,
          behavior: 'instant',
        });
      }
    };

    const handleResize = () => {
      const height = unscaledHeight();
      const shrunk = lastHeight - height;
      lastHeight = height;
      if (shrunk <= KEYBOARD_MIN_HEIGHT) return;
      clearTimeout(timer);
      timer = window.setTimeout(revealFocusedInput, SETTLE_DELAY);
    };

    viewport.addEventListener('resize', handleResize);
    return () => {
      viewport.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);
};
