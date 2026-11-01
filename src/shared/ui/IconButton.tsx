import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@headlessui/react';
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const iconButtonVariants = cva('rounded-md hover:brightness-80', {
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: { variant: 'primary' },
});

export type IconButtonProps = {
  label?: string;
  icon: IconProp;
  onClick: () => void;
  isDanger?: boolean;
  className?: string;
};

export const IconButton = ({
  label,
  icon,
  onClick,
  isDanger = false,
  className,
}: IconButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        iconButtonVariants({ variant: isDanger ? 'destructive' : 'primary' }),
        className,
      )}
    >
      {label}
      <FontAwesomeIcon icon={icon} widthAuto />
    </Button>
  );
};
