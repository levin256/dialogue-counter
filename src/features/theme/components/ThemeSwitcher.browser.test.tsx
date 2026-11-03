import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { useThemeStore } from '../stores/theme';
import { ThemeSwitcher } from './ThemeSwitcher';

// アプリと同じストア（localStorage に保存する）を使うので、テストごとに初めの状態に戻す
beforeEach(() => {
  localStorage.clear();
  useThemeStore.setState({ theme: 'system' });
  delete document.documentElement.dataset.theme;
});

describe('ThemeSwitcher', () => {
  it('初めは「OS に合わせる」が選択中になっている', async () => {
    const screen = await render(<ThemeSwitcher />);

    await expect
      .element(screen.getByRole('radio', { name: 'OS に合わせる' }))
      .toBeChecked();
    await expect
      .element(screen.getByRole('radio', { name: 'ダーク' }))
      .not.toBeChecked();
  });

  it('選んだテーマが選択中になり、<html data-theme> に付く', async () => {
    const screen = await render(<ThemeSwitcher />);
    await screen.getByRole('radio', { name: 'ダーク' }).click();

    await expect
      .element(screen.getByRole('radio', { name: 'ダーク' }))
      .toBeChecked();
    await expect
      .element(screen.getByRole('radio', { name: 'OS に合わせる' }))
      .not.toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('「OS に合わせる」を選び直すと、data-theme を外す', async () => {
    const screen = await render(<ThemeSwitcher />);
    await screen.getByRole('radio', { name: 'ライト' }).click();
    await expect
      .element(screen.getByRole('radio', { name: 'ライト' }))
      .toBeChecked();

    await screen.getByRole('radio', { name: 'OS に合わせる' }).click();

    await expect
      .element(screen.getByRole('radio', { name: 'OS に合わせる' }))
      .toBeChecked();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
