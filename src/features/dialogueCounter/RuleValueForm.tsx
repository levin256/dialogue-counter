import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputWithButton } from '../../components/ui/InputWithButton';
import {
  type RuleValueForm as RuleValueFormType,
  ruleValueFormSchema,
} from '../../schemas';

type RuleValueFormProps = {
  /** 登録済みの値。重複のチェックに使う */
  registered: readonly string[];
  /** 登録できる値が入力されたときに呼ばれる */
  onAdd: (value: string) => void;
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
  } = useForm<RuleValueFormType>({
    resolver: zodResolver(ruleValueFormSchema),
  });

  const onSubmit = ({ value }: RuleValueFormType) => {
    if (registered.includes(value)) {
      setError('value', { message: 'すでに登録されています。' });
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
      {errors.value && <p className="text-red-500">{errors.value.message}</p>}
    </>
  );
};
