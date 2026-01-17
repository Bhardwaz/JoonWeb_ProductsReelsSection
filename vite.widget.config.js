// vite.widget.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cssInjectedByJsPlugin(),
  ],
  server: {
    host: true
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'], 
  },
  build: {
    emptyOutDir: false,
    outDir: 'dist/reels-section', 
    rollupOptions: {
      input: './src/Widget-entry.jsx',
      output: {
        entryFileNames: 'reels-section.js',
        format: 'iife',
        name: 'MyWidget',
        inlineDynamicImports: true, 
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      }
    },
    cssCodeSplit: false, 
  }
})