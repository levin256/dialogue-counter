import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const SOURCE_URL = 'https://github.com/levin256/dialogue-counter';

/**
 * 入力したテキストを外に送らないことの説明と、それを確かめられるソースコードへのリンク。
 * 使い方ダイアログと、画面の下に置く。
 */
export const PrivacyNote = ({ className }: { className?: string }) => (
  <p className={cn('text-sm text-muted-foreground', className)}>
    入力したテキストは、このブラウザの中だけで数えています。どこにも送らず、保存もしません。
    <a
      href={SOURCE_URL}
      target="_blank"
      rel="noreferrer"
      className="ml-1 inline-flex items-center gap-0.5 whitespace-nowrap text-link hover:brightness-80"
    >
      ソースコード
      <ExternalLink className="size-3.5" aria-hidden />
      <span className="sr-only">（新しいタブで開く）</span>
    </a>
  </p>
);
