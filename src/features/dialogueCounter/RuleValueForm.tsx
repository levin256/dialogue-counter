import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputWithButton } from '../../components/ui/InputWithButton';
import {
  type RuleValueFormInput,
  type RuleValueFormOutput,
  ruleValueFormSchema,
} from '../../schemas';
import { type RuleValue, RuleValueError } from '../../utils/string';

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
};

/**
 * カウントルールの一覧（カウントしない文字・行の先頭文字）に、値を追加するフォーム。
 * 空・空白だけ・登録済みの値は、エラーを表示して追加しない。
 */
export const RuleValueForm = ({ registered, onAdd }: RuleValueFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<RuleValueFormInput, unknown, RuleValueFormOutput>({
    resolver: zodResolver(ruleValueFormSchema),
    // reset() で入力欄を空に戻すために必要（<form> 要素がないので、初期値がないと何も消えない）
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

  return (
    <>
      <InputWithButton
        className="flex w-60"
        register={register('value')}
        inputProps={{ placeholder: '文字を入力' }}
        buttonProps={{ onClick: handleSubmit(onSubmit), icon: faPlus }}
      />
      {errors.value && (
        <p className="text-red-500">{toErrorMessage(errors.value.message)}</p>
      )}
    </>
  );
};
