import { Field, Fieldset, Label, Legend } from '@headlessui/react';
import { CircleHelp } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Divider } from '@/shared/ui/Divider';
import { FieldsetGroup } from '@/shared/ui/FieldsetGroup';
import { Toggle } from '@/shared/ui/Toggle';
import { useCountRuleStore } from '../stores/countRule';
import { RuleValueList } from './RuleValueList';

type CountRuleSettingsProps = {
  /** 「?」ボタンが押されたときに呼ばれる */
  onOpenHowToUse: () => void;
};

/** カウントルールの設定欄。変更はそのままストアに保存する。 */
export const CountRuleSettings = ({
  onOpenHowToUse,
}: CountRuleSettingsProps) => {
  const {
    ignoreStrings,
    ignoreLinePrefixes,
    ignoreSpace,
    ignoreLineBreak,
    addIgnoreString,
    removeIgnoreString,
    addIgnoreLinePrefix,
    removeIgnoreLinePrefix,
    setIgnoreSpace,
    setIgnoreLineBreak,
  } = useCountRuleStore();

  return (
    <Fieldset className="flex flex-col gap-6 rounded-xl bg-card p-5">
      <div className="flex flex-row gap-3">
        <Legend className="font-semibold text-xl">設定</Legend>
        <Button
          variant="ghost"
          size="inline"
          icon={CircleHelp}
          aria-label="使い方を開く"
          onClick={onOpenHowToUse}
        />
      </div>

      <FieldsetGroup
        legend="特殊文字のカウント設定"
        className="flex flex-col gap-y-1.5"
      >
        <Field className="flex items-center gap-x-3">
          <Label>空白をカウントしない</Label>
          <Toggle checked={ignoreSpace} onChange={setIgnoreSpace} />
        </Field>
        <Field className="flex items-center gap-x-3">
          <Label>改行をカウントしない</Label>
          <Toggle checked={ignoreLineBreak} onChange={setIgnoreLineBreak} />
        </Field>
      </FieldsetGroup>

      <Divider />

      <RuleValueList
        legend="カウントしない文字"
        values={ignoreStrings}
        onAdd={addIgnoreString}
        onRemove={removeIgnoreString}
      />

      <Divider />

      <RuleValueList
        legend="カウントしない行の先頭文字"
        description={
          <p className="text-muted-foreground text-sm">
            行頭のスペースやタブは無視して判定します（例:
            <code className="whitespace-pre">{'「  // メモ」'}</code>
            も対象）
          </p>
        }
        values={ignoreLinePrefixes}
        onAdd={addIgnoreLinePrefix}
        onRemove={removeIgnoreLinePrefix}
      />
    </Fieldset>
  );
};
