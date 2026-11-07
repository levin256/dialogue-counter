import { useEffect } from 'react';

/** キーボードの高さ（px）を入れる CSS 変数の名前。index.css で、ページの下の余白に足す */
export const KEYBOARD_INSET = '--keyboard-inset';

/** 入力欄の下の端と、キーボードのあいだに空ける間隔（px） */
const GAP = 8;

/**
 * スマホでキーボードが出たときに、フォーカス中の1行の入力欄（とそのフォーム）が、キーボードに隠れないようにする。
 *
 * スマホのブラウザは、キーボードが出てもページの大きさを変えず、見えている範囲（visual viewport）だけを狭くする（iPhone など）。
 * ふつうはブラウザが入力欄を見える位置まで動かすが、ページのいちばん下の入力欄は、それ以上スクロールできずに隠れることがある。
 * そこで、キーボードが出ているあいだは、
 * 1. キーボードの高さを CSS 変数 `--keyboard-inset` に入れ、ページの下に同じだけ余白を足す（スクロールできる分を作る）
 * 2. フォームの下の端（エラーの文を含む）が見える範囲の外なら、見える位置までスクロールする
 *
 * 複数行の入力欄（テキストの入力欄）は縦に長く、動かすと文字を打っている位置から離れるので、ブラウザに任せる。
 */
export const useKeepFocusedInputVisible = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    let frame = 0;

    const handleResize = () => {
      // 拡大しているときも見える範囲は狭くなるので、拡大の分を戻してから、キーボードの高さを出す
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
        // エラーの文も見えるように、フォーム全体を見える範囲に入れる
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
