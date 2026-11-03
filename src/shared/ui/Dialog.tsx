import {
  DialogBackdrop,
  DialogPanel,
  Dialog as HeadlessDialog,
  DialogTitle as HeadlessDialogTitle,
} from '@headlessui/react';
import { cn } from '@/shared/lib/cn';

type DialogProps = {
  /** 開いているか */
  open: boolean;
  /** Esc・幕のクリックで閉じるときにも呼ばれる */
  onClose: () => void;
  /** ダイアログの中身 */
  children: React.ReactNode;
  className?: string;
};

/**
 * 画面の中央に出すダイアログ。後ろの幕・パネル・開閉のアニメーションを持ち、中身は children で受け取る。
 * 中に DialogTitle を置くと、それがダイアログの名前になる。
 *
 * @example
 * <Dialog open={isOpen} onClose={close}>
 *   <DialogTitle>タイトル</DialogTitle>
 *   <p>本文</p>
 * </Dialog>
 */
export const Dialog = ({ open, onClose, children, className }: DialogProps) => (
  <HeadlessDialog
    open={open}
    onClose={onClose}
    className="relative z-10 focus:outline-none"
  >
    <DialogBackdrop className="fixed inset-0 bg-overlay" />
    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            'w-full max-w-md rounded-xl bg-popover p-6 duration-300 ease-out data-[closed]:transform-[scale(90%)] data-[closed]:opacity-0 motion-reduce:transition-none',
            className,
          )}
        >
          {children}
        </DialogPanel>
      </div>
    </div>
  </HeadlessDialog>
);

/** ダイアログのタイトル（h2）。 */
export const DialogTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <HeadlessDialogTitle className={cn('mb-3 text-xl font-bold', className)}>
    {children}
  </HeadlessDialogTitle>
);
