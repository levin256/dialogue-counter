import { Switch } from '@headlessui/react';
import { cn } from '@/shared/lib/cn';

type ToggleProps = {
  /** 切り替えたときに、切り替えたあとの値で呼ばれる */
  onChange: (checked: boolean) => void;
  /** ON か */
  checked?: boolean;
  /** フォームで送るときの名前 */
  name?: string;
  className?: string;
};

/**
 * ON / OFF を切り替えるスイッチ（`role="switch"`）。
 * Headless UI の Field の中に Label と並べて置くと、Label がスイッチの名前になる。
 *
 * @example
 * <Field>
 *   <Label>空白をカウントしない</Label>
 *   <Toggle checked={ignoreSpace} onChange={setIgnoreSpace} />
 * </Field>
 */
export const Toggle = ({
  onChange,
  checked = false,
  name = '',
  className,
}: ToggleProps) => {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      name={name}
      className={cn(
        'group inline-flex h-6 w-11 items-center rounded-full bg-switch-track transition hover:brightness-80 data-checked:bg-primary motion-reduce:transition-none',
        className,
      )}
    >
      <span className="size-4 translate-x-1 rounded-full bg-switch-thumb transition group-data-checked:translate-x-6 motion-reduce:transition-none" />
    </Switch>
  );
};
