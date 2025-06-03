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
  } = useForm<IgnoreStringFormType>({
    resolver: zodResolver(ignoreStringFormSchema),
  });
  const { addIgnoreString } = useIgnoreStringStore();

  const onSubmit = (form: IgnoreStringFormType) => {
    addIgnoreString(form.ignoreString);
    reset();
  };

  return (
    <>
      <InputWithButton
        className="flex w-60"
        register={register('ignoreString')}
        inputProps={{ placeholder: 'Enter ignore string' }}
        buttonProps={{ onClick: handleSubmit(onSubmit), icon: faPlus }}
      />
      {/* TODO: エラー表示いい感じにする */}
      {errors.ignoreString && (
        <p className="error-text">{errors.ignoreString.message}</p>
      )}
    </>
  );
};
