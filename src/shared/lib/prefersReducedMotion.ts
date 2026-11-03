/**
 * OS で動きを減らす設定（「視差効果を減らす」など）になっているか。
 * なっていたら、アニメーションをやめて、すぐに変える。
 */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
