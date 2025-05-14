import { Input } from '@headlessui/react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { IconButton, type IconButtonProps } from './IconButton';

export type InputWithButtonProps = {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  register: UseFormRegisterReturn;
  buttonProps: IconButtonProps;
};

export const InputWithButton = ({
  inputProps,
  register,
  buttonProps,
}: InputWithButtonProps) => {
  return (
    <div className="flex w-60 pt-5">
      <Input
        {...register}
        {...inputProps}
        className="box-border flex-1 rounded-s-md border-none bg-neutral-600 px-2 py-1 outline-none"
      />
      <IconButton {...buttonProps} />
    </div>
  );
};
