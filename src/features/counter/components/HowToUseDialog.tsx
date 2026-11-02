import { Button } from '@/shared/ui/Button';
import { Dialog, DialogTitle } from '@/shared/ui/Dialog';
import { Heading } from '@/shared/ui/Heading';

type HowToUseDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** 使い方の説明。カウントルールの設定ごとに、何ができるかを書く。 */
export const HowToUseDialog = ({ isOpen, onClose }: HowToUseDialogProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>これはなに？</DialogTitle>
      <p>
        <b>テキスト</b>
        に入力された文字数をリアルタイムにカウントするツールです。
        <br />
        カウントには、以下のルールを設定できます。
      </p>
      <section>
        <Heading level={3} size="md" className="mt-3">
          特殊文字のカウント設定
        </Heading>
        <p className="text-base text-muted-foreground">
          空白・改行をカウントするかを設定できます。
          <br />
          空白には、半角・全角スペースのほか、タブなども含みます。
        </p>
      </section>
      <section>
        <Heading level={3} size="md" className="mt-3">
          カウントしない文字
        </Heading>
        <p className="text-base text-muted-foreground">
          指定した文字はカウントされません。
        </p>
      </section>
      <section>
        <Heading level={3} size="md" className="mt-3">
          カウントしない行の先頭文字
        </Heading>
        <p className="text-base text-muted-foreground">
          指定した文字で始まる行はカウントされません。
          <br />
          行頭のスペースやタブは無視して判定するので、インデントされた行も対象になります。
        </p>
      </section>
      <p className="mt-4 text-muted-foreground text-sm">
        この説明は、設定の横にある「?」ボタンからいつでも開けます。
      </p>
      <div className="mt-3 flex justify-end">
        {/* 初回に自動で開いたときも、「?」から開いたときも合う文言にする */}
        <Button onClick={onClose}>閉じる</Button>
      </div>
    </Dialog>
  );
};
