import { expect, type Page, test } from '@playwright/test';

// 使い方ダイアログを見たことにして、ダイアログが開かない状態で始める
const skipHowToUse = (page: Page) =>
  page.addInitScript(() => {
    localStorage.setItem(
      'how-to-use',
      JSON.stringify({ state: { hasSeen: true }, version: 0 }),
    );
  });

const textInput = (page: Page) =>
  page.getByRole('group', { name: 'テキスト' }).getByRole('textbox');
const ignoreStrings = (page: Page) =>
  page.getByRole('group', { name: 'カウントしない文字' });
const ignoreLinePrefixes = (page: Page) =>
  page.getByRole('group', { name: 'カウントしない行の先頭文字' });

test.describe('ルールの設定', () => {
  test.beforeEach(async ({ page }) => {
    await skipHowToUse(page);
    await page.goto('/');
  });

  test('テキストを入力すると、ルールに従った文字数が表示される', async ({
    page,
  }) => {
    await textInput(page).fill(
      // 初期値では、記号・空白・改行と、// で始まる行を数えない
      '「はい。」 そうです\n// メモ',
    );
    await expect(page.getByText('文字数 : 6')).toBeVisible();
  });

  test('空白・改行のトグルを切り替えると、文字数が変わる', async ({ page }) => {
    await textInput(page).fill('あ い\nう');
    await expect(page.getByText('文字数 : 3')).toBeVisible();

    await page.getByRole('switch', { name: '空白をカウントしない' }).click();
    await expect(page.getByText('文字数 : 4')).toBeVisible();

    await page.getByRole('switch', { name: '改行をカウントしない' }).click();
    await expect(page.getByText('文字数 : 5')).toBeVisible();
  });

  test('カウントしない文字を追加・削除できる', async ({ page }) => {
    const group = ignoreStrings(page);
    await group.getByRole('textbox').fill('ー');
    await group.getByRole('button', { name: '追加' }).click();
    await expect(
      group.getByRole('listitem').filter({ hasText: 'ー' }),
    ).toBeVisible();
    await expect(group.getByRole('textbox')).toHaveValue('');

    await group.getByRole('button', { name: '「ー」を削除' }).click();
    await expect(
      group.getByRole('listitem').filter({ hasText: 'ー' }),
    ).toHaveCount(0);
  });

  test('カウントしない行の先頭文字を追加・削除できる', async ({ page }) => {
    const group = ignoreLinePrefixes(page);
    await group.getByRole('textbox').fill('#');
    await group.getByRole('button', { name: '追加' }).click();
    await expect(
      group.getByRole('listitem').filter({ hasText: '#' }),
    ).toBeVisible();

    await group.getByRole('button', { name: '「#」を削除' }).click();
    await expect(
      group.getByRole('listitem').filter({ hasText: '#' }),
    ).toHaveCount(0);
  });

  test('空・空白だけ・登録済みの値を追加しようとすると、エラーが表示される', async ({
    page,
  }) => {
    const group = ignoreStrings(page);
    const input = group.getByRole('textbox');
    const add = group.getByRole('button', { name: '追加' });

    await add.click();
    await expect(group.getByText('文字を入力してください。')).toBeVisible();

    await input.fill(' ');
    await add.click();
    await expect(group.getByText('空白を指定できません。')).toBeVisible();

    await input.fill('。');
    await add.click();
    await expect(group.getByText('すでに登録されています。')).toBeVisible();
  });

  test('リロードしても、ルールの設定が残っている', async ({ page }) => {
    const group = ignoreStrings(page);
    await group.getByRole('textbox').fill('ー');
    await group.getByRole('button', { name: '追加' }).click();
    await page.getByRole('switch', { name: '空白をカウントしない' }).click();

    await page.reload();

    await expect(
      group.getByRole('listitem').filter({ hasText: 'ー' }),
    ).toBeVisible();
    await expect(
      page.getByRole('switch', { name: '空白をカウントしない' }),
    ).not.toBeChecked();
    await expect(
      page.getByRole('switch', { name: '改行をカウントしない' }),
    ).toBeChecked();
  });
});

test('保存されたルールが壊れていても画面が表示され、ルールが初期値になる', async ({
  page,
}) => {
  await skipHowToUse(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      'count-rule',
      JSON.stringify({ state: { ignoreStrings: 'broken' }, version: 0 }),
    );
  });
  await page.goto('/');

  await expect(
    ignoreStrings(page).getByRole('listitem').filter({ hasText: '。' }),
  ).toBeVisible();
});

test('使い方ダイアログは初回だけ自動で開き、「?」ボタンからは開ける', async ({
  page,
}) => {
  await page.goto('/');
  const dialog = page.getByRole('dialog', { name: 'これはなに？' });
  // ダイアログの外側の要素は大きさがないので、タイトルが見えるかで確かめる
  const title = dialog.getByRole('heading', { name: 'これはなに？' });
  await expect(title).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.reload();
  await expect(
    page.getByRole('heading', { name: '台詞カウンター' }),
  ).toBeVisible();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: '使い方を開く' }).click();
  await expect(title).toBeVisible();
});
