import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
    <div className="btn-container">
      <input
        {...register('ignoreLinePrefix')}
        placeholder="Enter ignore line."
      />
      <button
        type="button"
        className="add-btn"
        onClick={handleSubmit(onSubmit)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      {/* TODO: エラー表示いい感じにする */}
      {errors.ignoreLinePrefix && (
        <p className="error-text">{errors.ignoreLinePrefix.message}</p>
      )}
    </div>
  );
};
