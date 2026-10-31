import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@headlessui/react';

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
  className = '',
}: IconButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`rounded-md hover:brightness-80 ${isDanger ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'} ${className}`}
    >
      {label}
      <FontAwesomeIcon icon={icon} widthAuto />
    </Button>
  );
};
