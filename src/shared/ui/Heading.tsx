import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const headingVariants = cva('font-bold tracking-tight', {
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
    },
  },
  defaultVariants: { size: 'md' },
});

type HeadingProps = React.ComponentProps<'h1'> &
  VariantProps<typeof headingVariants> & {
    /** 文書の中での階層（h1〜h6）。見た目の大きさは size で決める */
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };

/**
 * 見出し。意味上の階層（level）と見た目の大きさ（size）を別々に指定する。
 *
 * @example
 * <Heading level={3} size="md">小見出し</Heading>
 */
export const Heading = ({ level, size, className, ...props }: HeadingProps) => {
  const Tag = `h${level}` as const;
  return (
    <Tag className={cn(headingVariants({ size }), className)} {...props} />
  );
};
