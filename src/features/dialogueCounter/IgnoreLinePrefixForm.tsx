import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputWithButton } from '../../components/ui/InputWithButton';
import {
  type IgnoreLinePrefixForm as IgnoreLinePrefixFormType,
  ignoreLinePrefixFormSchema,
} from '../../schemas';
import { useIgnoreLinePrefixStore } from '../../stores/ignoreLinePrefixes';

export const IgnoreLinePrefixForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<IgnoreLinePrefixFormType>({
    resolver: zodResolver(ignoreLinePrefixFormSchema),
  });
  const { ignoreLinePrefixes, addIgnoreLinePrefix } =
    useIgnoreLinePrefixStore();

  const onSubmit = (form: IgnoreLinePrefixFormType) => {
    if (
      ignoreLinePrefixes.some(
        ({ ignoreLinePrefix }) => ignoreLinePrefix === form.ignoreLinePrefix,
      )
    ) {
      setError('ignoreLinePrefix', { message: 'すでに登録されています。' });
      return;
    }
    addIgnoreLinePrefix(form.ignoreLinePrefix);
    reset();
  };

  return (
    <>
      <InputWithButton
        className="flex w-60"
        register={register('ignoreLinePrefix')}
        inputProps={{ placeholder: '文字を入力' }}
        buttonProps={{ onClick: handleSubmit(onSubmit), icon: faPlus }}
      />
      {errors.ignoreLinePrefix && (
        <p className="text-red-500">{errors.ignoreLinePrefix.message}</p>
      )}
    </>
  );
};
