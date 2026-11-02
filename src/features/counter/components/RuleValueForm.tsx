import { Description, Field, Label } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { InputGroup } from '@/shared/ui/InputGroup';
import type { RuleValue } from '../domain/countRule';
import {
  createRuleValueFormSchema,
  type RuleValueFormInput,
  type RuleValueFormOutput,
  toErrorMessage,
} from './ruleValueFormSchema';

type RuleValueFormProps = {
  /** 追加する先の一覧の名前。入力欄とボタンの名前に入れる */
  listName: string;
  /** 登録済みの値。重複のチェックに使う */
  registered: readonly RuleValue[];
  /** 登録できる値が入力されたときに呼ばれる */
  onAdd: (value: RuleValue) => void;
  /** 外から入力欄にフォーカスを移すときに使う */
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

/**
 * カウントルールの一覧（カウントしない文字・行の先頭文字）に、値を追加するフォーム。
 * 空・空白だけ・登録済みの値は、エラーを表示して追加しない。
 * Enter でも追加できる。エラーは入力欄に結び付け、表示したときに読み上げる。
 */
export const RuleValueForm = ({
  listName,
  registered,
  onAdd,
  inputRef,
}: RuleValueFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RuleValueFormInput, unknown, RuleValueFormOutput>({
    // 登録済みの一覧が変わるたびに、それと比べる schema で検証する
    resolver: zodResolver(createRuleValueFormSchema(registered)),
    // 追加したあと、reset() でこの値（空）に戻す
    defaultValues: { value: '' },
  });

  const onSubmit = ({ value }: RuleValueFormOutput) => {
    onAdd(value);
    reset();
  };

  // register() の ref は入力欄を見つけるのに使うので、外の ref と両方に入れる
  const { ref: registerRef, ...valueField } = register('value');
  const setInputRef = (element: HTMLInputElement | null) => {
    registerRef(element);
    if (inputRef) inputRef.current = element;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field className="flex flex-col gap-y-2">
        {/*
          見た目は囲みの見出しでわかるので、読み上げ用の名前だけを付ける。
          一覧は2つあるので、どちらの入力欄・ボタンか名前だけでわかるように、一覧の名前を入れる
        */}
        <Label className="sr-only">{`${listName}を入力`}</Label>
        <InputGroup className="w-60">
          <Input
            className="flex-1"
            placeholder="文字を入力"
            invalid={errors.value !== undefined}
            {...valueField}
            ref={setInputRef}
          />
          <Button
            type="submit"
            size="icon"
            icon={Plus}
            aria-label={`${listName}を追加`}
          />
        </InputGroup>
        {errors.value && (
          <Description role="alert" className="text-error">
            {toErrorMessage(errors.value.message)}
          </Description>
        )}
      </Field>
    </form>
  );
};
