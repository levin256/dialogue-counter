import {
  Description,
  Field,
  Label,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import { useState } from 'react';
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber';
import { useWarnIfUnsavedChanges } from '@/shared/hooks/useWarnIfUnsavedChanges';
import { Textarea } from '@/shared/ui/Input';
import { countText } from '../domain/countRule';
import { useCountRuleStore } from '../stores/countRule';
import { CountReview } from './CountReview';
import { PrivacyNote } from './PrivacyNote';

type TextCounterProps = {
  /** 文字数の横に置く操作（狭い画面で、設定へ飛ぶリンクなど） */
  headerAction?: React.ReactNode;
};

/**
 * 数えるテキストの入力欄と、カウントルールに従った文字数。テキストは保存しない。
 * 文字数は、長いテキストをスクロールしても見えるように、画面の上に貼り付ける。
 * 「確認」のタブでは、カウントしない部分を薄くしたテキストを出す。文字数はどちらのタブでも同じ。
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
          「文字数」は読み上げ用。見せると、スマホで桁が増えたとき「設定」が次の行に落ちる
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
      {/* 上の余白は、タブのフォーカスの枠が、貼り付けた文字数の帯に隠れないように空ける */}
      <TabGroup className="mx-5 mt-1">
        {/* 選んだタブは、下の枠と同じ背景にして、枠にくっついて見えるようにする */}
        <TabList className="flex">
          {['入力', '確認'].map((label) => (
            <Tab
              key={label}
              className="relative -mb-px rounded-t-md border border-transparent px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground data-selected:border-input data-selected:border-b-muted data-selected:bg-muted data-selected:text-foreground"
            >
              {label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {/*
            確認を開いているあいだも、入力欄は隠すだけで残す。消すと、戻ったときに Cmd+Z の履歴とカーソルの位置がなくなる。
            パネルではなく、中の入力欄にフォーカスが止まればよいので、パネルは Tab キーで止まらないようにする
          */}
          <TabPanel unmount={false} tabIndex={-1}>
            <Textarea
              // 入力に合わせて伸ばし、欄の中にはスクロールを作らない（ページのスクロールだけにする）。
              // 高さの下限は、画面の高さによらない決まった値にする。svh などの画面の高さの単位は、
              // iPhone の Chrome ではキーボードが出ると小さくなり、欄が縮んで下のものが動く。
              // block にして、文字の行に並べたときの下の隙間をなくし、確認の欄と高さをそろえる
              className="block field-sizing-content min-h-80 w-full resize-none rounded-tl-none lg:min-h-144"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="カウントしたい台詞を入力・貼り付けしてください"
            />
          </TabPanel>
          {/* 長いテキストで入力のたびに区間を描かないように、開いているときだけ描く（Headless UI の既定） */}
          <TabPanel>
            <CountReview
              text={text}
              countRule={countRule}
              className="min-h-80 rounded-tl-none lg:min-h-144"
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
      {/* 貼り付けるときに目に入るよう、入力欄のすぐ下に置く。Description にして、入力欄の説明として読み上げる */}
      <Description as="div" className="mx-5 mt-2 mb-5">
        <PrivacyNote />
      </Description>
    </Field>
  );
};
