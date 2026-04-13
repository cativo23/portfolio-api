import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@auth': path.resolve(__dirname, 'src/auth'),
      '@users': path.resolve(__dirname, 'src/users'),
      '@projects': path.resolve(__dirname, 'src/projects'),
      '@contacts': path.resolve(__dirname, 'src/contacts'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@database': path.resolve(__dirname, 'src/database'),
      '@health': path.resolve(__dirname, 'src/health'),
      '@src': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.module.ts',
        '**/*.eslintrc.*',
        'vitest.config.ts',
        'main.ts',
        'database/migrations/',
        'database/seeder*',
        'config/typeorm.config*',
      ],
    },
  },
});
