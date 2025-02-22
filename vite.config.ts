import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ton-wallet-generator-new/', // Имя твоего репозитория
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});