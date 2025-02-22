import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ton-wallet-generator-new/', // Имя репозитория
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});