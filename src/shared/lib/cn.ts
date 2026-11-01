import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * className を組み立てる。
 * 条件付きのクラス（clsx）を1つの文字列にし、ぶつかる Tailwind のクラスは、
 * あとに書いた方だけを残す（tailwind-merge）。
 *
 * @param inputs クラス。文字列のほか、`{ クラス: 条件 }` や配列、`false`・`undefined` も渡せる
 *
 * @example
 * cn('px-2 text-sm', isActive && 'bg-primary', className);
 * cn('px-2', 'px-3'); // => 'px-3'
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
