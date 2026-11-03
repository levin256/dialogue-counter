import { Description, Field, Label } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { displayWidth } from '@/shared/lib/displayWidth';
import { withViewTransition } from '@/shared/lib/viewTransition';
import { Button } from '@/shared/ui/Button';
import { CodeLabel } from '@/shared/ui/CodeLabel';
import { FieldsetGroup } from '@/shared/ui/FieldsetGroup';
import { Input } from '@/shared/ui/Input';
import type { RuleValue } from '../domain/countRule';
import {
  createRuleValueFormSchema,
  type RuleValueFormInput,
  type RuleValueFormOutput,
  toErrorMessage,
} from './ruleValueFormSchema';

type RuleValueListProps = {
  /** 一覧の見出し。追加の入力欄とボタンの名前にも入れる */
  legend: string;
  /** 見出しの下に出す補足の説明 */
  description?: React.ReactNode;
  /** 追加の入力欄に出す、入力例 */
  placeholder?: string;
  /** 登録済みの値 */
  values: readonly RuleValue[];
  /** 登録できる値が入力されたときに呼ばれる。index を渡されたら、その位置に入れる */
  onAdd: (value: RuleValue, index?: number) => void;
  /**
   * 値を削除するときに呼ばれる。restore を呼ぶと、元の位置に戻し、戻した項目にフォーカスを移す
   * （削除を取り消すときに使う）
   */
  onRemove: (value: RuleValue, restore: () => void) => void;
};

// 1マスに収まるのは、全角1文字（半角2文字）まで。マスが1つ増えるごとに、全角4文字ほど入る。
// いちばん狭いマス（3.5rem）でも全角1文字が入るように、マスの中の余白は詰めてある
const columnSpanOf = (value: RuleValue) => {
  const width = displayWidth(value);
  if (width <= 2) return 1;
  if (width <= 10) return 2;
  // 狭い画面でも1行のマスは4つあるので、3つまでにする（それより長いと末尾を「…」にする）
  return 3;
};

const COLUMN_SPAN = { 1: '', 2: 'col-span-2', 3: 'col-span-3' } as const;

/**
 * カウントルールの一覧（カウントしない文字・行の先頭文字）。登録済みの値と、値を追加するフォームを並べる。
 *
 * 空・空白だけ・登録済みの値は、エラーを表示して追加しない。Enter でも追加できる。
 * 削除したら、フォーカスを次の項目（最後なら前の項目、一覧が空なら追加の入力欄）に移す。
 */
export const RuleValueList = ({
  legend,
  description,
  placeholder,
  values,
  onAdd,
  onRemove,
}: RuleValueListProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<RuleValueFormInput, unknown, RuleValueFormOutput>({
    // 登録済みの一覧が変わるたびに、それと比べる schema で検証する
    resolver: zodResolver(createRuleValueFormSchema(values)),
    // 追加したあと、reset() でこの値（空）に戻す
    defaultValues: { value: '' },
  });

  const onSubmit = ({ value }: RuleValueFormOutput) => {
    onAdd(value);
    reset();
  };

  // 削除したあとにフォーカスを移す先を探すため、削除ボタンを値ごとに持つ
  const removeButtons = useRef(new Map<RuleValue, HTMLButtonElement>());

  // 押したボタンは一覧から消えるので、フォーカスが外れないように隣の項目へ移す
  const remove = (value: RuleValue) => {
    const index = values.indexOf(value);
    const neighbor = values[index + 1] ?? values[index - 1];
    // 消える項目をフェードで消してから、残りを詰める（動きは index.css の remove-rule-value）
    withViewTransition(() => {
      flushSync(() => onRemove(value, () => restore(value, index)));
      if (neighbor === undefined) {
        setFocus('value');
      } else {
        removeButtons.current.get(neighbor)?.focus();
      }
    }, 'remove-rule-value');
  };

  // 戻した項目の削除ボタンにフォーカスを移すため、先に DOM まで反映させる
  const restore = (value: RuleValue, index: number) => {
    flushSync(() => onAdd(value, index));
    removeButtons.current.get(value)?.focus();
  };

  return (
    <FieldsetGroup legend={legend} className="flex flex-col gap-y-2">
      {description}
      {/*
        1つずつは短いので、同じ幅のマスに並べて折り返す（マスは、欄の幅いっぱいに広げる）。
        長い値は、幅に合わせて複数のマスを使う
      */}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
        {values.map((value) => (
          <li
            key={value}
            // 削除のアニメーションで、項目ごとに動かす目印
            data-rule-value
            className={cn(
              'flex min-w-0 items-center gap-1 rounded-md border border-input bg-muted py-0.5 ps-1.5 pe-0.5',
              COLUMN_SPAN[columnSpanOf(value)],
            )}
          >
            <CodeLabel className="min-w-0 bg-transparent p-0">
              {value}
            </CodeLabel>
            {/* 値と削除ボタンを分けて、ボタンが値の文字に見えないようにする */}
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-input" />
            <Button
              ref={(element) => {
                if (element) removeButtons.current.set(value, element);
                return () => {
                  removeButtons.current.delete(value);
                };
              }}
              variant="ghost"
              size="inline"
              icon={Trash2}
              // 枠が項目の外にはみ出さないように、フォーカスの枠を離さない
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-error/15 hover:text-error hover:brightness-100 focus-visible:outline-offset-0 [&>svg]:size-3.5"
              aria-label={`「${value}」を削除`}
              onClick={() => remove(value)}
            />
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field className="flex flex-col gap-y-2">
          {/*
            見た目は囲みの見出しでわかるので、読み上げ用の名前だけを付ける。
            一覧は2つあるので、どちらの入力欄・ボタンか名前だけでわかるように、一覧の名前を入れる
          */}
          <Label className="sr-only">{`${legend}を入力`}</Label>
          {/* 入力欄とボタンは離して置く。くっつけると、フォーカスの枠が隣に重なり、角丸も片側だけになる */}
          <div className="flex gap-2">
            {/* 登録したあとの見た目（等幅）と同じ文字で入力する。全角と半角の違いも見分けやすい */}
            <Input
              className="flex-1 font-mono"
              placeholder={placeholder}
              invalid={errors.value !== undefined}
              {...register('value')}
            />
            {/* 見えている「追加」を含む名前にする（読み上げと見た目の名前をそろえる） */}
            <Button type="submit" icon={Plus} aria-label={`${legend}を追加`}>
              追加
            </Button>
          </div>
          {errors.value && (
            <Description role="alert" className="text-error">
              {toErrorMessage(errors.value.message)}
            </Description>
          )}
        </Field>
      </form>
    </FieldsetGroup>
  );
};
