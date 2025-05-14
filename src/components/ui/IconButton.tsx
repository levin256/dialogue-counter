import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@headlessui/react';

export type IconButtonProps = {
  label?: string;
  icon: IconProp;
  onClick: () => void;
  className?: string;
};

export const IconButton = ({
  label,
  icon,
  onClick,
  className = '',
}: IconButtonProps) => {
  return (
    <Button onClick={onClick} className={`rounded-md bg-teal-700 ${className}`}>
      {label}
      <FontAwesomeIcon icon={icon} className="ml-2" />
    </Button>
  );
};
