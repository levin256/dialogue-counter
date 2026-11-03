import { CircleHelp, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { CountRuleSettings } from '@/features/counter/components/CountRuleSettings';
import { HowToUseDialog } from '@/features/counter/components/HowToUseDialog';
import { PrivacyNote } from '@/features/counter/components/PrivacyNote';
import { TextCounter } from '@/features/counter/components/TextCounter';
import { useHowToUseStore } from '@/features/counter/stores/howToUse';
import { ThemeSwitcher } from '@/features/theme/components/ThemeSwitcher';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/Heading';

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
            className="whitespace-nowrap px-2 py-1.5"
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
              className="flex items-center gap-1 whitespace-nowrap rounded-md px-1 py-1.5 text-link text-sm hover:brightness-80 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              <span className="max-[380px]:sr-only">設定</span>
            </a>
          }
        />
        <CountRuleSettings id={SETTINGS_ID} />
      </main>
      <footer>
        <PrivacyNote />
      </footer>
      <HowToUseDialog isOpen={isOpen} onClose={closeHowToUse} />
    </div>
  );
};
