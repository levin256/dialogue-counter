import { Fieldset, Legend } from '@headlessui/react';
import type React from 'react';

type FieldsetGroupProps = {
  legend: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  legendClassName?: string;
};

export const FieldsetGroup = ({
  legend,
  children,
  className,
  legendClassName,
}: FieldsetGroupProps) => {
  return (
    <Fieldset className={className}>
      <Legend className={legendClassName}>{legend}</Legend>
      {children}
    </Fieldset>
  );
};
