import { defineConfig } from 'vitest/config';
import path from 'node:path';

process.env.NODE_ENV = 'test';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../src/core'),
      '@auth': path.resolve(__dirname, '../src/auth'),
      '@users': path.resolve(__dirname, '../src/users'),
      '@projects': path.resolve(__dirname, '../src/projects'),
      '@contacts': path.resolve(__dirname, '../src/contacts'),
      '@profile': path.resolve(__dirname, '../src/profile'),
      '@email': path.resolve(__dirname, '../src/email'),
      '@config': path.resolve(__dirname, '../src/config'),
      '@database': path.resolve(__dirname, '../src/database'),
      '@health': path.resolve(__dirname, '../src/health'),
      '@src': path.resolve(__dirname, '../src'),
    },
  },
  test: {
    globals: true,
    include: ['test/**/*.e2e-spec.ts'],
    environment: 'node',
  },
});
