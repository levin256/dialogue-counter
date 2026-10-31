import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // tsconfig.app.json の paths（@/ → src/）を、Vite と Vitest でも使う
  resolve: { tsconfigPaths: true },
});
