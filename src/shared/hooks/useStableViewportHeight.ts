import { useEffect } from 'react';

/** 開いたときの画面の高さ（px）。JS が動く前は、CSS 側で 100svh を使う */
export const STABLE_VIEWPORT_HEIGHT = '--stable-viewport-height';

/**
 * 開いたときの画面の高さを、CSS 変数 `--stable-viewport-height` に入れる。測り直すのは、幅が変わったとき（画面の回転など）だけ。
 * svh などは iPhone の Chrome ではキーボードが出ると小さくなり、入力欄にフォーカスしただけで欄が縮むため。
 */
export const useStableViewportHeight = () => {
  useEffect(() => {
    const root = document.documentElement;
    let width = window.innerWidth;
    // アドレスバーが出ているときの高さ（svh と同じ）
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
