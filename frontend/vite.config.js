import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    port: 3002,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
});
