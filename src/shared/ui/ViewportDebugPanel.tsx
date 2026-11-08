// TODO(#28): 実機（iPhone の Chrome）でキーボードの動きを調べるための、一時的な表示。issue を閉じる前に消す
import { useEffect, useState } from 'react';

type Snapshot = Record<string, string | number>;

/** 100svh などが、いま何 px になっているか */
const measureUnit = (unit: string) => {
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;height:100${unit}`;
  document.body.append(probe);
  const height = Math.round(probe.getBoundingClientRect().height);
  probe.remove();
  return height;
};

const takeSnapshot = (): Snapshot => {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  const active = document.activeElement;
  const textarea = document.querySelector('textarea');
  const form = active instanceof HTMLInputElement ? active.form : null;
  const error = form?.querySelector('[role="alert"]');
  const bottomOf = (element: Element | null | undefined) =>
    element ? Math.round(element.getBoundingClientRect().bottom) : '-';
  return {
    innerH: window.innerHeight,
    clientH: root.clientHeight,
    svh: measureUnit('svh'),
    lvh: measureUnit('lvh'),
    dvh: measureUnit('dvh'),
    vvH: Math.round(viewport?.height ?? -1),
    vvTop: Math.round(viewport?.offsetTop ?? -1),
    scale: viewport?.scale ?? -1,
    scrollY: Math.round(window.scrollY),
    scrollMax: root.scrollHeight - root.clientHeight,
    taH: textarea ? Math.round(textarea.getBoundingClientRect().height) : '-',
    focus: active?.tagName ?? '-',
    // 見えている範囲の下端。focusB / errB がこれより大きければ、キーボードに隠れている
    visB: Math.round((viewport?.offsetTop ?? 0) + (viewport?.height ?? 0)),
    focusB: active === document.body ? '-' : bottomOf(active),
    errB: bottomOf(error),
    formB: bottomOf(form),
  };
};

const format = (snapshot: Snapshot) =>
  Object.entries(snapshot)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

/** URL に ?debug を付けたときだけ、画面の上に、画面の高さやスクロールの数字と、起きたことの記録を出す */
export const ViewportDebugPanel = () => {
  const [snapshot, setSnapshot] = useState(takeSnapshot);
  const [log, setLog] = useState<string[]>([]);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const record = (event: string) => {
      const now = takeSnapshot();
      setSnapshot(now);
      setOffsetTop(window.visualViewport?.offsetTop ?? 0);
      const time = Math.round(performance.now() - start);
      setLog((lines) =>
        [`${time} ${event} ${format(now)}`, ...lines].slice(0, 12),
      );
    };

    const viewport = window.visualViewport;
    const onFocusIn = (e: FocusEvent) =>
      record(`focusin ${(e.target as Element).tagName}`);
    const onFocusOut = () => record('focusout');
    const onViewportResize = () => record('vv.resize');
    const onViewportScroll = () => record('vv.scroll');
    const onWindowResize = () => record('win.resize');
    // スクロールは多いので、記録には残さず、いまの数字だけ更新する
    const onScroll = () => {
      setSnapshot(takeSnapshot());
      setOffsetTop(window.visualViewport?.offsetTop ?? 0);
    };
    // テキストの入力欄の高さが、どのイベントのあとで変わったかを見る
    const textarea = document.querySelector('textarea');
    const textareaObserver = new ResizeObserver(() => record('ta.resize'));
    if (textarea) textareaObserver.observe(textarea);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    viewport?.addEventListener('resize', onViewportResize);
    viewport?.addEventListener('scroll', onViewportScroll);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      textareaObserver.disconnect();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      viewport?.removeEventListener('resize', onViewportResize);
      viewport?.removeEventListener('scroll', onViewportScroll);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 bg-black/80 p-1 font-mono text-[9px]/tight break-all text-white"
      // キーボードが出ているあいだも、見えている範囲の上に出す
      style={{ transform: `translateY(${offsetTop}px)` }}
    >
      <p className="text-yellow-300">{format(snapshot)}</p>
      {log.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 一時的な記録で、並べ替えない
        <p key={i}>{line}</p>
      ))}
    </div>
  );
};
