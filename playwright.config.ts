import { defineConfig, devices } from '@playwright/test';

const PORT = 5180;

export default defineConfig({
  testDir: './e2e',
  // Vitest の *.test.ts と混ざらないように、E2E は *.e2e.ts にする
  testMatch: '**/*.e2e.ts',
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // 別の dev サーバーをテストしないように、専用のポートで毎回立ち上げる
  webServer: {
    command: `pnpm dev --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
});
