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
  className = '',
  legendClassName = '',
}: FieldsetGroupProps) => {
  return (
    <fieldset
      className={`rounded-md border border-g px-3 pt-1 pb-3 ${className}`}
    >
      <legend
        className={`px 1nt-medium textextssm textextssm te ${legendClassName}`}
      >
        {legend}
      </legend>
      {children}
    </fieldset>
  );
};
