import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Build the Cipher Trace client as a browser-only single-page application. */
export default defineConfig({
  plugins: [react()],
});
