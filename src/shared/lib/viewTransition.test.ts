import { afterEach, describe, expect, it, vi } from 'vitest';
import { withViewTransition } from './viewTransition';

// 単体テストはブラウザのない環境で動くので、使う API だけを偽物で置く
const stubBrowser = ({
  reducesMotion = false,
  startViewTransition,
}: {
  reducesMotion?: boolean;
  startViewTransition?: (options: unknown) => void;
}) => {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && reducesMotion,
    }),
  });
  vi.stubGlobal('document', startViewTransition ? { startViewTransition } : {});
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('withViewTransition', () => {
  it('対応しているブラウザでは、種類を付けて View Transition を始める', () => {
    const startViewTransition = vi.fn();
    stubBrowser({ startViewTransition });
    const update = vi.fn();

    withViewTransition(update, 'theme');

    expect(startViewTransition).toHaveBeenCalledWith({
      update,
      types: ['theme'],
    });
    // update は、前の画面を撮ったあとにブラウザが呼ぶ
    expect(update).not.toHaveBeenCalled();
  });

  it('対応していないブラウザでは、update をすぐに呼ぶ', () => {
    stubBrowser({});
    const update = vi.fn();

    withViewTransition(update, 'theme');

    expect(update).toHaveBeenCalledOnce();
  });

  it('OS で動きを減らす設定のときは、アニメーションせずに update をすぐに呼ぶ', () => {
    const startViewTransition = vi.fn();
    stubBrowser({ reducesMotion: true, startViewTransition });
    const update = vi.fn();

    withViewTransition(update, 'theme');

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledOnce();
  });

  it('種類を渡せない古い実装でエラーになっても、update は呼ぶ', () => {
    stubBrowser({
      startViewTransition: () => {
        throw new TypeError('unsupported');
      },
    });
    const update = vi.fn();

    withViewTransition(update, 'theme');

    expect(update).toHaveBeenCalledOnce();
  });
});
