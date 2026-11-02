import { Description, Field, Label } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { InputGroup } from '@/shared/ui/InputGroup';
import { type RuleValue, RuleValueError } from '../domain/countRule';
import {
  type RuleValueFormInput,
  type RuleValueFormOutput,
  ruleValueFormSchema,
} from './ruleValueFormSchema';

const ERROR_MESSAGES: Record<RuleValueError, string> = {
  empty: '文字を入力してください。',
  whitespace: '空白を指定できません。',
  duplicate: 'すでに登録されています。',
};

// エラーには理由のコードが入っているので、表示する文言に変える
const toErrorMessage = (code: string | undefined) => {
  const result = RuleValueError.safeParse(code);
  return result.success ? ERROR_MESSAGES[result.data] : code;
};

type RuleValueFormProps = {
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
  registered,
  onAdd,
  inputRef,
}: RuleValueFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<RuleValueFormInput, unknown, RuleValueFormOutput>({
    resolver: zodResolver(ruleValueFormSchema),
    // 追加したあと、reset() でこの値（空）に戻す
    defaultValues: { value: '' },
  });

  const onSubmit = ({ value }: RuleValueFormOutput) => {
    if (registered.includes(value)) {
      setError('value', { message: 'duplicate' satisfies RuleValueError });
      return;
    }
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
        {/* 見た目は囲みの見出しでわかるので、読み上げ用の名前だけを付ける */}
        <Label className="sr-only">追加する文字</Label>
        <InputGroup className="w-60">
          <Input
            className="flex-1"
            placeholder="文字を入力"
            invalid={errors.value !== undefined}
            {...valueField}
            ref={setInputRef}
          />
          <Button type="submit" size="icon" icon={Plus} aria-label="追加" />
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
