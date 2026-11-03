import { Field, Fieldset, Label, Legend } from '@headlessui/react';
import { useState } from 'react';
import { Divider } from '@/shared/ui/Divider';
import { FieldsetGroup } from '@/shared/ui/FieldsetGroup';
import { Toast } from '@/shared/ui/Toast';
import { Toggle } from '@/shared/ui/Toggle';
import type { RuleValue } from '../domain/countRule';
import { useCountRuleStore } from '../stores/countRule';
import { RuleValueList } from './RuleValueList';

type CountRuleSettingsProps = {
  /** 設定欄の id。狭い画面で、テキストの上から設定へ飛ぶリンクの行き先にする */
  id?: string;
};

/** 最後に削除した値と、それを元に戻す関数（どの一覧のどの位置に戻すかは、一覧が知っている） */
type Removed = {
  value: RuleValue;
  restore: () => void;
};

/**
 * カウントルールの設定欄。変更はそのままストアに保存する。
 * PC では、テキストをスクロールしても設定が見えるように、画面の上に貼り付ける。
 *
 * 登録した値は確認なしですぐに消すので、消したあと少しのあいだ「元に戻す」を出す。
 */
export const CountRuleSettings = ({ id }: CountRuleSettingsProps) => {
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

  const [removed, setRemoved] = useState<Removed | null>(null);

  const undo = () => {
    removed?.restore();
    setRemoved(null);
  };

  return (
    <Fieldset
      id={id}
      // 飛んできたとき、見出しが画面の端に貼り付かないように少し空ける
      className="flex scroll-mt-4 flex-col gap-5 rounded-xl bg-card p-5 lg:sticky lg:top-4"
    >
      <Legend className="font-semibold text-xl">設定</Legend>

      <FieldsetGroup
        legend="特殊文字のカウント設定"
        className="flex flex-col gap-y-2"
      >
        <Field className="flex items-center justify-between gap-x-3">
          <Label>空白をカウントしない</Label>
          <Toggle checked={ignoreSpace} onChange={setIgnoreSpace} />
        </Field>
        <Field className="flex items-center justify-between gap-x-3">
          <Label>改行をカウントしない</Label>
          <Toggle checked={ignoreLineBreak} onChange={setIgnoreLineBreak} />
        </Field>
      </FieldsetGroup>

      <Divider />

      <RuleValueList
        legend="カウントしない文字"
        placeholder="例: 、 。 ！"
        values={ignoreStrings}
        onAdd={addIgnoreString}
        onRemove={(value, restore) => {
          removeIgnoreString(value);
          setRemoved({ value, restore });
        }}
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
        placeholder="例: // ※"
        values={ignoreLinePrefixes}
        onAdd={addIgnoreLinePrefix}
        onRemove={(value, restore) => {
          removeIgnoreLinePrefix(value);
          setRemoved({ value, restore });
        }}
      />

      {/* 一覧のすぐあとに置き、キーボードでも削除したところから近い順に届くようにする */}
      <Toast
        message={removed && `「${removed.value}」を削除しました`}
        actionLabel="元に戻す"
        onAction={undo}
        onClose={() => setRemoved(null)}
      />
    </Fieldset>
  );
};
