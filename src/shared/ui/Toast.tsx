import { useEffect, useEffectEvent, useState } from 'react';
import { Button } from '@/shared/ui/Button';

type ToastProps = {
  /** 表示する文。null のあいだは何も表示しない。文が変わると、表示の時間を数え直す */
  message: string | null;
  /** 操作ボタンの文言 */
  actionLabel: string;
  /** 操作ボタンが押されたときに呼ばれる */
  onAction: () => void;
  /** 表示の時間が過ぎたときに呼ばれる */
  onClose: () => void;
  /** 表示しておく時間（ミリ秒）。マウスが乗っているあいだと、中にフォーカスがあるあいだは閉じない */
  duration?: number;
};

/**
 * 画面の下に短く出す通知（トースト）。操作ボタンを1つ持てる。
 *
 * 通知は読み上げでも伝わるように、`role="status"` の中に出す。
 * 読み上げソフトは、あとから現れた領域の変化を拾えないことがあるので、領域はいつも置いておき、中身だけを出し入れする。
 *
 * @example
 * <Toast message="「、」を削除しました" actionLabel="元に戻す" onAction={undo} onClose={close} />
 */
export const Toast = ({ message, ...props }: ToastProps) => (
  <div
    role="status"
    className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4"
  >
    {/* 文が変わったら作り直して、ホバー・フォーカスの状態と時間を最初からにする */}
    {message !== null && (
      <ToastBody key={message} message={message} {...props} />
    )}
  </div>
);

const ToastBody = ({
  message,
  actionLabel,
  onAction,
  onClose,
  duration = 6000,
}: Omit<ToastProps, 'message'> & { message: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPaused = isHovered || isFocused;
  // onClose が描画のたびに作り直されても、時間を数え直さない
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
  }, [isPaused, duration]);

  return (
    // 閉じる時間を止めるために、マウスとフォーカスの出入りだけを見る。操作は中のボタンが受ける
    // biome-ignore lint/a11y/noStaticElementInteractions: 押せるものではなく、時間を止めるためだけに見ている
    <div
      className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-popover py-2 ps-4 pe-2 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <p>{message}</p>
      <Button variant="ghost" className="px-2" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
};
