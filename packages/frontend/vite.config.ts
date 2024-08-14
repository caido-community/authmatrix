import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
import prefixwrap from "postcss-prefixwrap";

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "src"),
      },
    ],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "plugin-template-frontend",
      fileName: (format) => "script.js",
      formats: ["es"],
    },
    outDir: "../../dist/frontend",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        prefixwrap("#plugin--autorize"),
      ],
    }
  },
  define: { 'process.env.NODE_ENV': '"production"' }
});
