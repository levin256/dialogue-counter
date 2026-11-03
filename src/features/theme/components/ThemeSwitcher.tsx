import { Radio, RadioGroup } from '@headlessui/react';
import { type LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { withViewTransition } from '@/shared/lib/viewTransition';
import { type Theme, useThemeStore } from '../stores/theme';

const OPTIONS: readonly { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'ライト', icon: Sun },
  { value: 'dark', label: 'ダーク', icon: Moon },
  { value: 'system', label: 'OS に合わせる', icon: Monitor },
];

// 読み込み時は index.html のスクリプトが付けるので、ここでは選び直したときだけ付け替える
const applyTheme = (theme: Theme) => {
  if (theme === 'system') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
};

/**
 * テーマの切り替え（ライト・ダーク・OS に合わせる）。選んだテーマを保存し、`<html data-theme>` に反映する。
 * 色が一度に変わると目にきついので、前の画面からフェードで切り替える（動きは index.css の theme）。
 */
export const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore();

  const changeTheme = (next: Theme) =>
    withViewTransition(() => {
      applyTheme(next);
      // 選んだボタンの見た目も、切り替えたあとの画面に入れる
      flushSync(() => setTheme(next));
    }, 'theme');

  return (
    <RadioGroup
      value={theme}
      onChange={changeTheme}
      aria-label="テーマ"
      className="flex rounded-md border border-input bg-card p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <Radio
          key={value}
          value={value}
          aria-label={label}
          title={label}
          className="cursor-pointer rounded p-1.5 text-muted-foreground hover:text-foreground data-checked:bg-muted data-checked:text-foreground"
        >
          <Icon className="size-4" />
        </Radio>
      ))}
    </RadioGroup>
  );
};
