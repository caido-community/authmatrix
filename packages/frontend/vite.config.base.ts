import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
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
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        prefixwrap("#plugin--authmatrix"),
      ],
    }
  },
});
