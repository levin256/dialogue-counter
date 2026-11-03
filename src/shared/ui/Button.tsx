import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// ホバーで暗くするのは、押せるものに共通の反応なので base に置く
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-md hover:brightness-80',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        ghost: 'text-link',
      },
      size: {
        default: 'px-3 py-1.5 text-sm/6 font-semibold',
        // アイコンだけのボタン。高さは入力欄と同じ 36px
        icon: 'px-3 py-2.5',
        // 文字の横に並べる。余白を付けない
        inline: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

// 文字がないボタンは、読み上げる名前（aria-label）がないと何のボタンかわからないので、型で必須にする
type ButtonContent =
  | { children: React.ReactNode; icon?: LucideIcon }
  | { children?: never; icon: LucideIcon; 'aria-label': string };

/** Button の props。`<button>` の属性に、見た目（variant・size）とアイコンを足したもの。 */
export type ButtonProps = Omit<React.ComponentProps<'button'>, 'children'> &
  VariantProps<typeof buttonVariants> &
  ButtonContent;

/**
 * ボタン。文字だけ・アイコン付き・アイコンだけの3通りで使う。
 * アイコンだけのときは `aria-label` が必須。
 */
export const Button = ({
  variant,
  size,
  icon: Icon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    // フォームの中でも、明示しない限り送信しないようにする
    type={type}
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  >
    {/* lucide のアイコンは、既定で読み上げから外れる（aria-hidden） */}
    {Icon && <Icon className="size-4" />}
    {children}
  </button>
);
