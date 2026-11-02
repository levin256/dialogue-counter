import { Description, Field, Label } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { CodeLabel } from '@/shared/ui/CodeLabel';
import { FieldsetGroup } from '@/shared/ui/FieldsetGroup';
import { Input } from '@/shared/ui/Input';
import { InputGroup } from '@/shared/ui/InputGroup';
import type { RuleValue } from '../domain/countRule';
import {
  createRuleValueFormSchema,
  type RuleValueFormInput,
  type RuleValueFormOutput,
  toErrorMessage,
} from './ruleValueFormSchema';

type RuleValueListProps = {
  /** 一覧の見出し。追加の入力欄とボタンの名前にも入れる */
  legend: string;
  /** 見出しの下に出す補足の説明 */
  description?: React.ReactNode;
  /** 登録済みの値 */
  values: readonly RuleValue[];
  /** 登録できる値が入力されたときに呼ばれる */
  onAdd: (value: RuleValue) => void;
  /** 値を削除するときに呼ばれる */
  onRemove: (value: RuleValue) => void;
};

/**
 * カウントルールの一覧（カウントしない文字・行の先頭文字）。登録済みの値と、値を追加するフォームを並べる。
 *
 * 空・空白だけ・登録済みの値は、エラーを表示して追加しない。Enter でも追加できる。
 * 削除したら、フォーカスを次の項目（最後なら前の項目、一覧が空なら追加の入力欄）に移す。
 */
export const RuleValueList = ({
  legend,
  description,
  values,
  onAdd,
  onRemove,
}: RuleValueListProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<RuleValueFormInput, unknown, RuleValueFormOutput>({
    // 登録済みの一覧が変わるたびに、それと比べる schema で検証する
    resolver: zodResolver(createRuleValueFormSchema(values)),
    // 追加したあと、reset() でこの値（空）に戻す
    defaultValues: { value: '' },
  });

  const onSubmit = ({ value }: RuleValueFormOutput) => {
    onAdd(value);
    reset();
  };

  // 削除したあとにフォーカスを移す先を探すため、削除ボタンを値ごとに持つ
  const removeButtons = useRef(new Map<RuleValue, HTMLButtonElement>());

  // 押したボタンは一覧から消えるので、フォーカスが外れないように隣の項目へ移す
  const remove = (value: RuleValue) => {
    const index = values.indexOf(value);
    const neighbor = values[index + 1] ?? values[index - 1];
    onRemove(value);
    if (neighbor === undefined) {
      setFocus('value');
    } else {
      removeButtons.current.get(neighbor)?.focus();
    }
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
                ref={(element) => {
                  if (element) removeButtons.current.set(value, element);
                  return () => {
                    removeButtons.current.delete(value);
                  };
                }}
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field className="flex flex-col gap-y-2">
          {/*
            見た目は囲みの見出しでわかるので、読み上げ用の名前だけを付ける。
            一覧は2つあるので、どちらの入力欄・ボタンか名前だけでわかるように、一覧の名前を入れる
          */}
          <Label className="sr-only">{`${legend}を入力`}</Label>
          <InputGroup className="w-60">
            <Input
              className="flex-1"
              placeholder="文字を入力"
              invalid={errors.value !== undefined}
              {...register('value')}
            />
            <Button
              type="submit"
              size="icon"
              icon={Plus}
              aria-label={`${legend}を追加`}
            />
          </InputGroup>
          {errors.value && (
            <Description role="alert" className="text-error">
              {toErrorMessage(errors.value.message)}
            </Description>
          )}
        </Field>
      </form>
    </FieldsetGroup>
  );
};
