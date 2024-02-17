/// <reference types="vitest" />

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite-react-ts-gh/',
  plugins: [react(), tsconfigPaths()],
  build: {
    sourcemap: true,
  },
  test: {
    globals: true,
    include: [
      '**/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
    exclude: [
      '**/*.test.js',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.{idea,git,cache,output,temp,tmp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],
    environment: 'happy-dom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      enabled: true,
      provider: 'c8',
      reporter: ['html', 'lcovonly', 'text', 'text-summary'],
    },
    css: {
      modules: {
        classNameStrategy: 'stable',
      },
    },
    deps: {
      interopDefault: true,
    },
  },
});
