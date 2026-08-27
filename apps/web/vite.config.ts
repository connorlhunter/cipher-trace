import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

/** Build the Cipher Trace client as a browser-only single-page application. */
export default defineConfig({
  plugins: lazyPlugins(() => [react()]) ?? [],
});
