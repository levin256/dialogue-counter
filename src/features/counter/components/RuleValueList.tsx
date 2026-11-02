import { Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { CodeLabel } from '@/shared/ui/CodeLabel';
import { FieldsetGroup } from '@/shared/ui/FieldsetGroup';
import { InputGroup } from '@/shared/ui/InputGroup';
import type { RuleValue } from '../domain/countRule';
import { RuleValueForm } from './RuleValueForm';

type RuleValueListProps = {
  /** 一覧の見出し */
  legend: string;
  /** 見出しの下に出す補足の説明 */
  description?: React.ReactNode;
  /** 登録済みの値 */
  values: readonly RuleValue[];
  /** 値を追加するときに呼ばれる */
  onAdd: (value: RuleValue) => void;
  /** 値を削除するときに呼ばれる */
  onRemove: (value: RuleValue) => void;
};

/**
 * カウントルールの一覧（カウントしない文字・行の先頭文字）。登録済みの値と、追加するフォームを並べる。
 */
export const RuleValueList = ({
  legend,
  description,
  values,
  onAdd,
  onRemove,
}: RuleValueListProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 押したボタンは一覧から消えるので、フォーカスが外れないように追加の入力欄へ移す
  const remove = (value: RuleValue) => {
    onRemove(value);
    inputRef.current?.focus();
  };

  return (
    <FieldsetGroup legend={legend} className="flex flex-col gap-y-2">
      {description}
      <ul className="flex flex-col gap-y-2">
        {values.map((value) => (
          <li key={value}>
            <InputGroup className="w-60">
              <CodeLabel>{value}</CodeLabel>
              <Button
                variant="destructive"
                size="icon"
                icon={Trash2}
                aria-label={`「${value}」を削除`}
                onClick={() => remove(value)}
              />
            </InputGroup>
          </li>
        ))}
      </ul>
      <RuleValueForm registered={values} onAdd={onAdd} inputRef={inputRef} />
    </FieldsetGroup>
  );
};
