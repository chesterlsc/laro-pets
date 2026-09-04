import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3000', viewport: { width: 1440, height: 900 } },
  webServer: { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120_000 },
});
