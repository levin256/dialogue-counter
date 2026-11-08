import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { cn } from '@/shared/lib/cn';

type InputReviewTabsProps = {
  /** 「入力」のタブの中身。枠なしで渡す */
  input: React.ReactNode;
  /** 「確認」のタブの中身。枠なしで渡す。開いているときだけ描く */
  review: React.ReactNode;
  className?: string;
};

// 選んだタブの背景は、下の枠の背景（入力は入力欄の色、確認は周りと同じ色）に合わせる
const TABS = [
  {
    label: '入力',
    selectedClassName: 'data-selected:border-b-muted data-selected:bg-muted',
  },
  {
    label: '確認',
    selectedClassName: 'data-selected:border-b-card data-selected:bg-card',
  },
];

/**
 * 「入力」と「確認」を切り替えるタブ。選んだタブが下の枠にくっついて見える。
 * 枠と、中にフォーカスがあるときの枠の線は、この部品が描くので、中身は枠なしで渡す。
 */
export const InputReviewTabs = ({
  input,
  review,
  className,
}: InputReviewTabsProps) => (
  <TabGroup className={className}>
    <TabList className="flex">
      {TABS.map(({ label, selectedClassName }) => (
        <Tab
          key={label}
          // 選んだタブは、下の線を枠の背景の色にして、枠の上の線に 1px 重ねて隠す
          className={cn(
            'relative -mb-px rounded-t-md border border-transparent px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground data-selected:border-input data-selected:text-foreground',
            selectedClassName,
          )}
        >
          {label}
        </Tab>
      ))}
    </TabList>
    {/*
      中身ではなく枠に、フォーカスの枠を描く。中身に描くと、中身の角は四角いので、角の丸い枠と形が合わない。
      左端の「入力」を選んでいるときは（選んだパネルに data-selected が付く）、
      - 左上の角を、タブとつながるように四角くする
      - 背景を入力欄の色にする。確認のときは周りと同じ色にして、入力できそうに見えないようにする
    */}
    <TabPanels className="rounded-md border border-input bg-card **:focus-visible:outline-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring has-[>[data-selected]:first-child]:rounded-tl-none has-[>[data-selected]:first-child]:bg-muted">
      {/*
        確認を開いているあいだも、入力の中身は隠すだけで残す。消すと、戻ったときに Cmd+Z の履歴とカーソルの位置がなくなる。
        パネルではなく、中の入力欄にフォーカスが止まればよいので、パネルは Tab キーで止まらないようにする
      */}
      <TabPanel unmount={false} tabIndex={-1}>
        {input}
      </TabPanel>
      {/* 長いテキストで入力のたびに区間を描かないように、開いているときだけ描く（Headless UI の既定） */}
      <TabPanel>{review}</TabPanel>
    </TabPanels>
  </TabGroup>
);
