import { prefersReducedMotion } from './prefersReducedMotion';

/**
 * DOM の変化を、View Transitions API でアニメーションさせる。
 * 対応していないブラウザや、OS で動きを減らす設定のときは、アニメーションなしで update だけを呼ぶ。
 *
 * update は、アニメーションするときは後から（変化の前の画面を撮ってから）呼ばれる。
 * フォーカスの移動など、変化のあとにすることも update の中に書く。
 *
 * @param update DOM を変える処理。React の state を変えるときは flushSync で包み、この中で DOM まで反映させる
 * @param type アニメーションの種類。CSS の `:active-view-transition-type()` で、種類ごとに動きを決める
 *
 * @example
 * withViewTransition(() => {
 *   flushSync(() => setTheme('dark'));
 * }, 'theme');
 */
export const withViewTransition = (update: () => void, type: string) => {
  if (!('startViewTransition' in document) || prefersReducedMotion()) {
    update();
    return;
  }
  try {
    document.startViewTransition({ update, types: [type] });
  } catch {
    // 種類（types）を渡せない古い実装では、アニメーションなしにする
    update();
  }
};
