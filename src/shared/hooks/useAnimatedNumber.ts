import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/shared/lib/prefersReducedMotion';

/**
 * 動き始めてから progress（0〜1）だけ進んだときに、表示する値。終わりに向けてゆっくりにする（ease-out）。
 *
 * @param from 動き始めたときに表示していた値
 * @param target 最終的に表示する値
 * @param progress 進み具合。0 で from、1 で target になる。0〜1 の外は、近いほうの端として扱う
 * @returns 表示する値（整数）
 */
export const animatedValueAt = (
  from: number,
  target: number,
  progress: number,
) => {
  // フレームの時刻が動き始めより前だとマイナスになり、from の外の値（-0 など）が出るため
  const clamped = Math.min(Math.max(progress, 0), 1);
  const eased = 1 - (1 - clamped) ** 3;
  return Math.round(from + (target - from) * eased);
};

/**
 * 数値が変わったときに、表示する値を前の値から少しずつ近づける（カウントアップ）。
 * OS で動きを減らす設定のときは、すぐに新しい値にする。
 *
 * @param target 最終的に表示する値
 * @param duration 近づけるのにかける時間（ミリ秒）
 * @returns いま表示する値
 */
export const useAnimatedNumber = (target: number, duration = 300) => {
  const [value, setValue] = useState(target);
  // 途中で target が変わったら、表示中の値から続けて動かす
  const valueRef = useRef(target);

  useEffect(() => {
    const from = valueRef.current;
    if (from === target || prefersReducedMotion()) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = (now - start) / duration;
      valueRef.current = animatedValueAt(from, target, progress);
      setValue(valueRef.current);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};
