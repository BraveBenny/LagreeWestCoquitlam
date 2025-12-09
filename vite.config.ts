import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This allows Vercel environment variables to be picked up.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This is critical: It replaces 'process.env.API_KEY' in your code
      // with the actual value from the environment during the build.
      // This prevents "process is not defined" errors in the browser.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});