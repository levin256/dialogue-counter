import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputWithButton } from '../../components/ui/InputWithButton';
import {
  type IgnoreStringForm as IgnoreStringFormType,
  ignoreStringFormSchema,
} from '../../schemas';
import { useIgnoreStringStore } from '../../stores/ignoreStrings';

export const IgnoreStringForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<IgnoreStringFormType>({
    resolver: zodResolver(ignoreStringFormSchema),
  });
  const { ignoreStrings, addIgnoreString } = useIgnoreStringStore();

  const onSubmit = (form: IgnoreStringFormType) => {
    if (
      ignoreStrings.some(
        ({ ignoreString }) => ignoreString === form.ignoreString,
      )
    ) {
      setError('ignoreString', { message: 'すでに登録されています。' });
      return;
    }
    addIgnoreString(form.ignoreString);
    reset();
  };

  return (
    <>
      <InputWithButton
        className="flex w-60"
        register={register('ignoreString')}
        inputProps={{ placeholder: '文字を入力' }}
        buttonProps={{ onClick: handleSubmit(onSubmit), icon: faPlus }}
      />
      {errors.ignoreString && (
        <p className="text-red-500">{errors.ignoreString.message}</p>
      )}
    </>
  );
};
