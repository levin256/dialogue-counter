import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { Heading } from './Heading';
import { LabelButton } from './LabelButton';

type DialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const HowToUseDialog: React.FC<DialogProps> = ({ isOpen, setIsOpen }) => {
  const close = async () => {
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={close}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(90%)] w-full max-w-md rounded-xl bg-neutral-700 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0"
          >
            <DialogTitle className="mb-3 font-bold text-white text-xl">
              これはなに？
            </DialogTitle>
            <p>
              <b>テキスト</b>
              に入力された文字数をリアルタイムにカウントするツールです。
              <br />
              カウントには、以下のルールを設定できます。
            </p>
            <Heading level={5} className="mt-3">
              特殊文字のカウント設定
            </Heading>
            <p className="text-base text-white/65">
              空白・改行をカウントするかを設定できます。
            </p>
            <Heading level={5} className="mt-3">
              カウントしない文字
            </Heading>
            <p className="text-base text-white/65">
              指定した文字はカウントされません。
            </p>
            <Heading level={5} className="mt-3">
              カウントしない行の先頭文字
            </Heading>
            <p className="text-base text-white/65">
              指定した文字で始まる行はカウントされません。
            </p>
            <div className="mt-3 flex justify-end">
              <LabelButton
                label="はじめる"
                className="inline-flex items-center px-3 py-1.5 font-semibold text-sm/6"
                onClick={close}
              />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default HowToUseDialog;
