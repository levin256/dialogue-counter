import { cn } from '@/shared/lib/cn';

/** 短い文字列を、等幅の文字で1行に表示する。長いときは末尾を「…」にする。 */
export const CodeLabel = ({
  className,
  ...props
}: React.ComponentProps<'code'>) => (
  <code
    // 末尾の「…」（text-overflow）は flex の中の文字には効かないので、block にする。
    // truncate ははみ出した分を切るので、下線は下の余白（py）の中に収まるように引く。余白がないと、
    // フォントや画面の倍率しだいで、下線が切れたり切れなかったりする。太さも、倍率で消えないように 1px に決める
    className={cn(
      'block flex-1 truncate rounded-md bg-muted px-2 py-1 text-left text-sm underline decoration-muted-foreground decoration-1 underline-offset-4',
      className,
    )}
    {...props}
  />
);
