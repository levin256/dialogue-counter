import {
  Input as HeadlessInput,
  type InputProps as HeadlessInputProps,
  Textarea as HeadlessTextarea,
  type TextareaProps as HeadlessTextareaProps,
} from '@headlessui/react';
import { cn } from '@/shared/lib/cn';

// 入力欄と複数行の入力欄で、枠と背景をそろえる
const fieldClassName = 'rounded-md border border-input bg-muted';

// Headless UI の className は関数も受け取れるが、cn() で合わせるので文字列だけにする。
// ref は react-hook-form の register() が入力欄を見つけるのに使う
type FieldProps<Props, E> = Omit<Props, 'className'> & {
  className?: string;
  ref?: React.Ref<E>;
};

/** 1行の入力欄。Headless UI の Field の中に置くと、Label・Description と結び付く。 */
export const Input = ({
  className,
  ...props
}: FieldProps<HeadlessInputProps, HTMLInputElement>) => (
  <HeadlessInput
    className={cn(fieldClassName, 'min-w-0 px-2 py-1', className)}
    {...props}
  />
);

/** 複数行の入力欄。Headless UI の Field の中に置くと、Label・Description と結び付く。 */
export const Textarea = ({
  className,
  ...props
}: FieldProps<HeadlessTextareaProps, HTMLTextAreaElement>) => (
  <HeadlessTextarea
    className={cn(fieldClassName, 'p-3', className)}
    {...props}
  />
);
