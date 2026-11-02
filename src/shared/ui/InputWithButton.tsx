import { Input } from '@headlessui/react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Button, type ButtonProps } from './Button';

export type InputWithButtonProps = {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  register: UseFormRegisterReturn;
  buttonProps: ButtonProps;
  className?: string;
};

export const InputWithButton = ({
  inputProps,
  register,
  buttonProps,
  className,
}: InputWithButtonProps) => {
  return (
    <div className={className}>
      <Input
        {...register}
        {...inputProps}
        className="box-border flex-1 rounded-s-md border-none bg-input px-2 py-1 outline-none"
      />
      <Button {...buttonProps} size="icon" className="rounded-l-none" />
    </div>
  );
};
