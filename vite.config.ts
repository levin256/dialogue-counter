/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

// ブラウザ（DOM・React の描画）が要るテストだけを、この名前にしてブラウザで流す
const BROWSER_TESTS = 'src/**/*.browser.test.{ts,tsx}';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // tsconfig.app.json の paths（@/ → src/）を、Vite と Vitest でも使う
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: ['src/**/*.test.ts'],
          exclude: [BROWSER_TESTS],
        },
      },
      {
        extends: true,
        // ブラウザで読む依存は、流す前にまとめておく（Vite の依存の事前バンドル）。
        // Vitest は、そのとき見つけたテストのファイルからだけ依存を探す。あとから新しい依存を読むテストを足すと、
        // テストの途中でまとめ直しになり、React が2つ読み込まれて落ちる。src のすべてから探しておく
        optimizeDeps: { entries: ['src/**/*.{ts,tsx}'] },
        test: {
          name: 'browser',
          include: [BROWSER_TESTS],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
