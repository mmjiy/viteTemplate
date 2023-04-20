import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import alias from "./build/alias.config"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve:{
    alias:alias.resolve.alias,
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
  },
})
