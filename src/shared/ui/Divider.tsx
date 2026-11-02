import { cn } from '@/shared/lib/cn';

/** 内容の区切りの線。<hr> なので、読み上げでも区切りとして伝わる。 */
export const Divider = ({
  className,
  ...props
}: React.ComponentProps<'hr'>) => (
  <hr className={cn('my-1 border-border', className)} {...props} />
);
