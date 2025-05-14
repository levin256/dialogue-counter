import { CodeLabel, type CodeLabelProps } from './CodeLabel';
import { IconButton, type IconButtonProps } from './IconButton';

export type CodeLabelButtonProps = {
  codeLabelProps: CodeLabelProps;
  buttonProps: IconButtonProps;
};

export const CodeLabelWithButton = ({
  codeLabelProps,
  buttonProps,
}: CodeLabelButtonProps) => {
  return (
    <>
      <CodeLabel {...codeLabelProps} />
      <IconButton {...buttonProps} />
    </>
  );
};
