import { Field, Label } from '@headlessui/react';
import { useState } from 'react';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';
import { useWarnIfUnsavedChanges } from '@/shared/hooks/useWarnIfUnsavedChanges';
import { Textarea } from '@/shared/ui/Input';
import { countText } from '../domain/countRule';
import { useCountRuleStore } from '../stores/countRule';

type TextCounterProps = {
  /** 文字数の横に置く操作（狭い画面で、設定へ飛ぶリンクなど） */
  headerAction?: React.ReactNode;
};

/**
 * 数えるテキストの入力欄と、カウントルールに従った文字数。テキストは保存しない。
 * 文字数は、長いテキストをスクロールしても見えるように、画面の上に貼り付ける。
 */
export const TextCounter = ({ headerAction }: TextCounterProps) => {
  const countRule = useCountRuleStore();
  const [text, setText] = useState('');
  // 他の値から計算できるので state にせず、レンダーのたびに計算する
  const textCount = countText(text, countRule);
  // 貼り付けたときなどに、数字が飛ばずに増えて見えるようにする
  const displayedCount = useAnimatedNumber(textCount);

  useWarnIfUnsavedChanges(text.length > 0);

  return (
    <Field className="flex flex-col rounded-xl bg-card">
      <div className="sticky top-0 z-1 flex flex-wrap items-end gap-x-3 gap-y-1 rounded-t-xl bg-card px-5 pt-4 pb-3">
        <Label className="me-auto whitespace-nowrap font-semibold text-xl">
          テキスト
        </Label>
        {/*
          見出しではなく値なので、p にする。入力のたびに読み上げるとうるさいので、aria-live は付けない。
          間の空白は、読み上げとコピーで「文字数 6 文字」と区切られるように入れる（見た目の間隔は gap で付ける）
        */}
        <p className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-muted-foreground text-sm">文字数</span>{' '}
          <span className="font-bold text-3xl tabular-nums tracking-tight sm:text-4xl">
            {displayedCount.toLocaleString('ja-JP')}
          </span>{' '}
          <span className="text-sm">文字</span>
        </p>
        {headerAction}
      </div>
      <Textarea
        // 入力に合わせて伸ばし、欄の中にはスクロールを作らない（ページのスクロールだけにする）。
        // 上の余白は、フォーカスの枠が、貼り付けた文字数の帯に隠れないように空ける
        className="field-sizing-content mx-5 mt-1 mb-5 min-h-[60dvh] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="カウントしたい台詞を入力・貼り付けしてください"
      />
    </Field>
  );
};
