import { Button } from '@/shared/ui/Button';
import { Dialog, DialogTitle } from '@/shared/ui/Dialog';
import { PrivacyNote } from './PrivacyNote';

type HowToUseDialogProps = {
  /** 開いているか */
  isOpen: boolean;
  /** 閉じるボタン・Esc・幕のクリックで呼ばれる */
  onClose: () => void;
};

/**
 * 使い方の説明。ひと目で読み終わる量にするため、できることを1行ずつ並べるだけにする。
 * 細かい決まり（空白にタブも含む、など）は設定パネルの側に書く。
 */
export const HowToUseDialog = ({ isOpen, onClose }: HowToUseDialogProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>これはなに？</DialogTitle>
      <p>
        <b>テキスト</b>に入力した文字数を、リアルタイムに数えるツールです。
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>空白・改行を数えるか選べる</li>
        <li>指定した文字を数えない</li>
        <li>指定した文字で始まる行を数えない</li>
      </ul>
      <PrivacyNote className="mt-4" />
      <p className="mt-2 text-sm text-muted-foreground">
        この説明は、右上の「使い方」からいつでも開けます。
      </p>
      <div className="mt-3 flex justify-end">
        {/* 初回に自動で開いたときも、「使い方」から開いたときも合う文言にする */}
        <Button onClick={onClose}>閉じる</Button>
      </div>
    </Dialog>
  );
};
