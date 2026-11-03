import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { RuleValue } from '../domain/countRule';
import { RuleValueList } from './RuleValueList';

// 一覧を持つのは親なので、ストアの代わりに state で一覧を持ち、最後に削除した値を戻すボタンを置く
const ListWithUndo = ({ initialValues }: { initialValues: RuleValue[] }) => {
  const [values, setValues] = useState(initialValues);
  const [restore, setRestore] = useState<(() => void) | null>(null);
  return (
    <>
      <RuleValueList
        legend="カウントしない文字"
        values={values}
        onAdd={(value, index) =>
          setValues((current) => {
            const at = index ?? current.length;
            return [...current.slice(0, at), value, ...current.slice(at)];
          })
        }
        onRemove={(value, restoreValue) => {
          setValues((current) => current.filter((v) => v !== value));
          setRestore(() => restoreValue);
        }}
      />
      <button type="button" onClick={() => restore?.()}>
        元に戻す
      </button>
    </>
  );
};

const renderList = (initialValues: string[]) =>
  render(
    <ListWithUndo
      initialValues={initialValues.map((value) => RuleValue.parse(value))}
    />,
  );

const removeButton = (
  screen: Awaited<ReturnType<typeof renderList>>,
  value: string,
) => screen.getByRole('button', { name: `「${value}」を削除` });

describe('RuleValueList', () => {
  describe('削除したあとのフォーカス', () => {
    it('前と次の両方に項目があれば、次の項目の削除ボタンに移る', async () => {
      const screen = await renderList(['、', '。', '！']);
      await removeButton(screen, '。').click();

      await expect.element(removeButton(screen, '。')).not.toBeInTheDocument();
      await expect.element(removeButton(screen, '！')).toHaveFocus();
    });

    it('最後の項目なら、前の項目の削除ボタンに移る', async () => {
      const screen = await renderList(['、', '。', '！']);
      await removeButton(screen, '！').click();

      await expect.element(removeButton(screen, '。')).toHaveFocus();
    });

    it('一覧が空になったら、追加の入力欄に移る', async () => {
      const screen = await renderList(['、']);
      await removeButton(screen, '、').click();

      await expect
        .element(
          screen.getByRole('textbox', { name: 'カウントしない文字を入力' }),
        )
        .toHaveFocus();
    });
  });

  it('元に戻すと、元の位置に戻り、戻した項目の削除ボタンにフォーカスが移る', async () => {
    const screen = await renderList(['、', '。', '！']);
    await removeButton(screen, '。').click();
    await expect.element(removeButton(screen, '。')).not.toBeInTheDocument();

    await screen.getByRole('button', { name: '元に戻す' }).click();

    await expect
      .poll(() =>
        screen
          .getByRole('listitem')
          .elements()
          .map((item) => item.textContent),
      )
      .toEqual(['、', '。', '！']);
    await expect.element(removeButton(screen, '。')).toHaveFocus();
  });

  it('Enter でも追加でき、追加したら入力欄を空にする', async () => {
    const screen = await renderList([]);
    const input = screen.getByRole('textbox', {
      name: 'カウントしない文字を入力',
    });
    await input.fill('ー');
    await userEvent.keyboard('{Enter}');

    await expect.element(removeButton(screen, 'ー')).toBeInTheDocument();
    await expect.element(input).toHaveValue('');
  });

  it('登録済みの値は追加せず、エラーを表示する', async () => {
    const screen = await renderList(['。']);
    await screen
      .getByRole('textbox', { name: 'カウントしない文字を入力' })
      .fill('。');
    await screen
      .getByRole('button', { name: 'カウントしない文字を追加' })
      .click();

    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('すでに登録されています。');
    expect(screen.getByRole('listitem').elements()).toHaveLength(1);
  });
});
