import { cn } from '@/shared/lib/cn';

/** 短い文字列を、等幅の文字で1行に表示する。長いときは末尾を「…」にする。 */
export const CodeLabel = ({
  className,
  ...props
}: React.ComponentProps<'code'>) => (
  <code
    // 末尾の「…」（text-overflow）は flex の中の文字には効かないので、block にする
    className={cn(
      'block flex-1 truncate rounded-md bg-muted px-2 py-1 text-left text-sm underline decoration-muted-foreground underline-offset-4',
      className,
    )}
    {...props}
  />
);
