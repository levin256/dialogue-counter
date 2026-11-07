import { Fieldset, Legend } from '@headlessui/react';
import type React from 'react';
import { cn } from '@/shared/lib/cn';

type FieldsetGroupProps = {
  /** グループの見出し。読み上げでは、グループの名前になる */
  legend: React.ReactNode;
  /** まとめる入力 */
  children: React.ReactNode;
  className?: string;
};

/** 見出し（legend）付きで、関係する入力をまとめる。読み上げでは、見出しがグループの名前になる。 */
export const FieldsetGroup = ({
  legend,
  children,
  className,
}: FieldsetGroupProps) => {
  return (
    // fieldset は既定で中身より狭くならないので、min-w-0 がないと狭い画面ではみ出す
    <Fieldset className={cn('min-w-0', className)}>
      <Legend className="font-semibold">{legend}</Legend>
      {children}
    </Fieldset>
  );
};
