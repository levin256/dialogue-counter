import { Button } from '@headlessui/react';
import { cn } from '@/shared/lib/cn';

export type LabelButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export const LabelButton = ({
  label,
  onClick,
  className,
}: LabelButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'rounded-md bg-primary text-primary-foreground hover:brightness-80',
        className,
      )}
    >
      {label}
    </Button>
  );
};
