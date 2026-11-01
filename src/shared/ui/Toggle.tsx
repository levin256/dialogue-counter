import { Switch } from '@headlessui/react';
import { cn } from '@/shared/lib/cn';

type ToggleProps = {
  onChange: (checked: boolean) => void;
  checked?: boolean;
  name?: string;
  className?: string;
};

export const Toggle = ({
  onChange,
  checked = false,
  name = '',
  className,
}: ToggleProps) => {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      name={name}
      className={cn(
        'group inline-flex h-6 w-11 items-center rounded-full bg-switch-track transition hover:brightness-80 data-checked:bg-primary',
        className,
      )}
    >
      <span className="size-4 translate-x-1 rounded-full bg-switch-thumb transition group-data-checked:translate-x-6" />
    </Switch>
  );
};
