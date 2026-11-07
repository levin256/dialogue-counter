import { useEffect } from 'react';

/** 画面の高さ（px）を入れる CSS 変数の名前。JS が動く前は、CSS で 100svh を代わりに使う */
export const STABLE_VIEWPORT_HEIGHT = '--stable-viewport-height';

/**
 * 開いたときの画面の高さを、CSS 変数 `--stable-viewport-height` に px で入れる。
 * 高さだけが変わったとき（キーボードやアドレスバーの出入り）は入れ直さず、
 * 幅が変わったとき（画面の回転、ウィンドウの大きさの変更）だけ入れ直す。
 *
 * svh などの単位は、スマホのブラウザによっては、キーボードが出ると小さくなる（iPhone の Chrome など）。
 * それを高さに使うと、入力欄にフォーカスしただけで、欄が縮んで下のものが動くので、こちらを使う。
 */
export const useStableViewportHeight = () => {
  useEffect(() => {
    const root = document.documentElement;
    let width = window.innerWidth;
    // clientHeight は、アドレスバーが出ているときの高さ（svh と同じ）
    const update = () => {
      root.style.setProperty(STABLE_VIEWPORT_HEIGHT, `${root.clientHeight}px`);
    };
    update();

    const handleResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      update();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      root.style.removeProperty(STABLE_VIEWPORT_HEIGHT);
    };
  }, []);
};
