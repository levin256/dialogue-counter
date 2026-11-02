import { Button, type ButtonProps } from './Button';
import { CodeLabel, type CodeLabelProps } from './CodeLabel';

export type CodeLabelButtonProps = {
  codeLabelProps: CodeLabelProps;
  buttonProps: ButtonProps;
  className?: string;
};

export const CodeLabelWithButton = ({
  codeLabelProps,
  buttonProps,
  className,
}: CodeLabelButtonProps) => {
  return (
    <div className={className}>
      <CodeLabel {...codeLabelProps} />
      <Button {...buttonProps} size="icon" className="rounded-l-none" />
    </div>
  );
};
