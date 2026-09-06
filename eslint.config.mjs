import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { ignores: ['next-env.d.ts', 'node_modules/**', '.next/**', 'out/**', '_src/**', 'playwright-report/**', 'test-results/**'] },
]);
