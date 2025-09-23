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
  } = useForm<IgnoreLinePrefixFormType>({
    resolver: zodResolver(ignoreLinePrefixFormSchema),
  });
  const { addIgnoreLinePrefix } = useIgnoreLinePrefixStore();

  const onSubmit = (form: IgnoreLinePrefixFormType) => {
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
