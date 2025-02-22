import { defineConfig } from 'vite';
import { Buffer } from 'buffer';

// Полифилл Buffer для браузера
export default defineConfig({
  base: '/ton-wallet-generator-new/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    'global.Buffer': 'Buffer', // Определяем Buffer как глобальный объект
  },
  resolve: {
    alias: {
      buffer: 'buffer', // Указываем путь к полифиллу
    },
  },
});