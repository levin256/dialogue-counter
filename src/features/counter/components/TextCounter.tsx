import { Description, Field, Label } from '@headlessui/react';
import { useState } from 'react';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';
import { useWarnIfUnsavedChanges } from '@/shared/hooks/useWarnIfUnsavedChanges';
import { Textarea } from '@/shared/ui/Input';
import { countText } from '../domain/countRule';
import { useCountRuleStore } from '../stores/countRule';
import { PrivacyNote } from './PrivacyNote';

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
        <Label className="me-auto text-xl font-semibold whitespace-nowrap">
          テキスト
        </Label>
        {/*
          見出しではなく値なので、p にする。入力のたびに読み上げるとうるさいので、aria-live は付けない。
          間の空白は、読み上げとコピーで「文字数 6 文字」と区切られるように入れる（見た目の間隔は gap で付ける）。
          「文字数」は、数字と「文字」で何かわかるので見た目からは消し、読み上げ用にだけ残す。
          消さないと、スマホの幅で桁が増えたときに、横の「設定」が次の行に落ちる
        */}
        <p className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="sr-only">文字数</span>{' '}
          <span className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
            {displayedCount.toLocaleString('ja-JP')}
          </span>{' '}
          <span className="text-sm">文字</span>
        </p>
        {headerAction}
      </div>
      <Textarea
        // 入力に合わせて伸ばし、欄の中にはスクロールを作らない（ページのスクロールだけにする）。
        // 上の余白は、フォーカスの枠が、貼り付けた文字数の帯に隠れないように空ける。
        // 高さの下限は、開いたときの画面の高さの 60%（useStableViewportHeight）。dvh や svh だと、スマホで
        // アドレスバーやキーボードが出入りするたびに欄が伸び縮みし、下のものが上下に動く。JS が動く前は svh を使う
        className="mx-5 mt-1 field-sizing-content min-h-[calc(var(--stable-viewport-height,100svh)*0.6)] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="カウントしたい台詞を入力・貼り付けしてください"
      />
      {/* 貼り付けるときに目に入るよう、入力欄のすぐ下に置く。Description にして、入力欄の説明として読み上げる */}
      <Description as="div" className="mx-5 mt-2 mb-5">
        <PrivacyNote />
      </Description>
    </Field>
  );
};
