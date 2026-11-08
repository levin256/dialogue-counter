import { cn } from '@/shared/lib/cn';
import type { CountRule } from '../domain/countRule';
import { applyCountRule } from '../domain/countText';

type CountReviewProps = {
  /** 入力したテキスト */
  text: string;
  /** 何をカウントしないか */
  countRule: CountRule;
  className?: string;
};

/**
 * 入力したテキストを読み取り専用で出し、カウントしない部分を薄くする。
 * 改行と折り返しは、入力欄（textarea の既定の pre-wrap と break-word）に、内側の余白は入力欄の p-3 に合わせる。
 * 枠は持たない（置く側が描く）。
 * 区間はここで計算するので、この部品を描いているあいだしか計算しない。
 */
export const CountReview = ({
  text,
  countRule,
  className,
}: CountReviewProps) => (
  <div className={cn('p-3 wrap-break-word whitespace-pre-wrap', className)}>
    {text === '' ? (
      <p className="text-muted-foreground">
        テキストを入力すると、カウントしない部分を薄くして表示します
      </p>
    ) : (
      applyCountRule(text, countRule).map(({ text, counted }, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: 区間は入力のたびに作り直し、並べ替えないので、位置で区別してよい
          key={i}
          data-counted={counted}
          className={counted ? undefined : 'text-uncounted-foreground'}
        >
          {text}
        </span>
      ))
    )}
  </div>
);
