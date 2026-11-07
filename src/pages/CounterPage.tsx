import { CircleHelp, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { CountRuleSettings } from '@/features/counter/components/CountRuleSettings';
import { HowToUseDialog } from '@/features/counter/components/HowToUseDialog';
import { TextCounter } from '@/features/counter/components/TextCounter';
import { useHowToUseStore } from '@/features/counter/stores/howToUse';
import { ThemeSwitcher } from '@/features/theme/components/ThemeSwitcher';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/Heading';
import { ViewportDebugPanel } from '@/shared/ui/ViewportDebugPanel';

const SETTINGS_ID = 'count-rule-settings';

/**
 * 文字数を数える画面。PC ではテキストと設定を横に並べ、狭い画面では縦に並べる。
 * 毎回使うテキストを先に置き、狭い画面でも上に来るようにする。
 */
export const CounterPage = () => {
  const { hasSeen, markAsSeen } = useHowToUseStore();
  // 自動で開くのは、まだ一度も閉じていないときだけ
  const [isOpen, setIsOpen] = useState(!hasSeen);
  const closeHowToUse = () => {
    setIsOpen(false);
    markAsSeen();
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 lg:p-6">
      <header className="flex items-center justify-between gap-3">
        {/* スマホの幅でも、タイトルと右のボタンが1行に収まる大きさにする */}
        <Heading
          level={1}
          size="xl"
          className="whitespace-nowrap max-sm:text-xl"
        >
          台詞カウンター
        </Heading>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="inline"
            icon={CircleHelp}
            className="px-2 py-1.5 whitespace-nowrap"
            onClick={() => setIsOpen(true)}
          >
            {/* とても狭い画面では、アイコンだけにする（文字は読み上げ用に残す） */}
            <span className="max-[380px]:sr-only">使い方</span>
          </Button>
          <ThemeSwitcher />
        </div>
      </header>
      <main className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <TextCounter
          headerAction={
            // 縦に並べたときは、テキストが長いと設定が遠くなるので、飛ぶリンクを置く
            <a
              href={`#${SETTINGS_ID}`}
              className="flex items-center gap-1 rounded-md px-1 py-1.5 text-sm whitespace-nowrap text-link hover:brightness-80 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              {/* スマホでは、桁の多い文字数と1行に並ぶように、アイコンだけにする */}
              <span className="max-sm:sr-only">設定</span>
            </a>
          }
        />
        <CountRuleSettings id={SETTINGS_ID} />
      </main>
      <HowToUseDialog isOpen={isOpen} onClose={closeHowToUse} />
      {/* TODO(#27): 実機の調査用。issue を閉じる前に消す */}
      {new URLSearchParams(window.location.search).has('debug') && (
        <ViewportDebugPanel />
      )}
    </div>
  );
};
