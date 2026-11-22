import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from './prefersReducedMotion';

// 単体テストはブラウザのない環境で動くので、matchMedia だけを偽物で置く
const stubMatchMedia = (matchingQuery: string | null) => {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({ matches: query === matchingQuery }),
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('prefersReducedMotion', () => {
  it('動きを減らす設定なら、true を返す', () => {
    stubMatchMedia('(prefers-reduced-motion: reduce)');
    expect(prefersReducedMotion()).toBe(true);
  });

  it('動きを減らす設定でなければ、false を返す', () => {
    stubMatchMedia(null);
    expect(prefersReducedMotion()).toBe(false);
  });
});
