import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  base: '/bill-please',
  plugins: [react(), EnvironmentPlugin('all'), viteTsconfigPaths(), VitePWA()],
  server: {
    port: 3000,
    open: true,
  },
});
