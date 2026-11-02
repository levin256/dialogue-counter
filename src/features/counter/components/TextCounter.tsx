import { Field, Label } from '@headlessui/react';
import { useState } from 'react';
import { useWarnIfUnsavedChanges } from '@/shared/hooks/useWarnIfUnsavedChanges';
import { Textarea } from '@/shared/ui/Input';
import { countText } from '../domain/countRule';
import { useCountRuleStore } from '../stores/countRule';

/** 数えるテキストの入力欄と、カウントルールに従った文字数。テキストは保存しない。 */
export const TextCounter = () => {
  const countRule = useCountRuleStore();
  const [text, setText] = useState('');
  // 他の値から計算できるので state にせず、レンダーのたびに計算する
  const textCount = countText(text, countRule);

  useWarnIfUnsavedChanges(text.length > 0);

  return (
    <Field className="flex flex-col gap-3.5 rounded-xl bg-card p-5">
      <Label className="font-semibold text-xl">テキスト</Label>
      {/* 見出しではなく値なので、p にする。入力のたびに読み上げるとうるさいので、aria-live は付けない */}
      <p className="font-bold tracking-tight">文字数 : {textCount}</p>
      <Textarea
        className="h-[64rem]"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="カウントしたい文字を入力してください"
      />
    </Field>
  );
};
