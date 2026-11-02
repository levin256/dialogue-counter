import { useState } from 'react';
import { CountRuleSettings } from '@/features/counter/components/CountRuleSettings';
import HowToUseDialog from '@/features/counter/components/HowToUseDialog';
import { TextCounter } from '@/features/counter/components/TextCounter';
import { useHowToUseStore } from '@/features/counter/stores/howToUse';
import { Heading } from '@/shared/ui/Heading';

const CounterPage = () => {
  const { hasSeen, markAsSeen } = useHowToUseStore();
  // 自動で開くのは、まだ一度も閉じていないときだけ
  const [isOpen, setIsOpen] = useState(!hasSeen);
  const closeHowToUse = () => {
    setIsOpen(false);
    markAsSeen();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col justify-start gap-y-3 p-4 pb-36">
      <Heading level={1} size="xl">
        台詞カウンター
      </Heading>
      <CountRuleSettings onOpenHowToUse={() => setIsOpen(true)} />
      <TextCounter />
      <HowToUseDialog isOpen={isOpen} onClose={closeHowToUse} />
    </div>
  );
};

export default CounterPage;
