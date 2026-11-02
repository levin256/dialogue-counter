import { cn } from '@/shared/lib/cn';

/**
 * 入力欄・ラベル・ボタンを、隙間なく横につなげる。
 * 角を丸めるのは両端だけにして、つなげた全体を1つの部品に見せる。
 *
 * @example
 * <InputGroup>
 *   <Input />
 *   <Button icon={Plus} aria-label="追加" />
 * </InputGroup>
 */
export const InputGroup = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      'flex *:rounded-none *:first:rounded-s-md *:last:rounded-e-md',
      className,
    )}
    {...props}
  />
);
