import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const appNodeModules = path.resolve(__dirname, 'node_modules');
const rootNodeModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        inline: ['@tanstack/react-query', '@testing-library/react'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: path.resolve(appNodeModules, 'react'),
      'react-dom': path.resolve(appNodeModules, 'react-dom'),
      'react/jsx-runtime': path.resolve(appNodeModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(appNodeModules, 'react/jsx-dev-runtime'),
      '@tanstack/react-query': path.resolve(rootNodeModules, '@tanstack/react-query'),
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
