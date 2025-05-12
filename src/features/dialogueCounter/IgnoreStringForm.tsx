import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
    <div className="btn-container">
      <input {...register('ignoreString')} placeholder="Enter ignore string." />
      <button
        type="button"
        className="add-btn"
        onClick={handleSubmit(onSubmit)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      {/* TODO: エラー表示いい感じにする */}
      {errors.ignoreString && (
        <p className="error-text">{errors.ignoreString.message}</p>
      )}
    </div>
  );
};
