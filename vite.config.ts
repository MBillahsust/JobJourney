// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Use regex aliases so any "package@1.2.3[/subpath]" becomes "package[/subpath]"
    alias: [
      // "@/..." -> "<repo>/src/..."
      { find: /^@\//, replacement: `${resolve(__dirname, 'src')}/` },

      // Strip version suffix from bare imports, e.g. "lucide-react@0.487.0"
      // Works for both unscoped ("recharts@2.15.2") and scoped ("@radix-ui/react-tabs@1.1.3")
      {
        find: /^(@?[^/]+(?:\/[^/]+)?)@\d+\.\d+\.\d+(?=\/|$)/,
        replacement: '$1',
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true,
    port: 5173,        // Vite default is 5173; change if you want
    strictPort: false, // bump to 5174 if busy
    open: false,
  },
  preview: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'esnext',
    outDir: 'build',   // keep your previous output folder
    sourcemap: true,
  },
});
