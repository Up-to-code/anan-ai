import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 1200 },
  server: {
    fs: {
      allow: [".."],
    },
  },
  resolve: {
    alias: {
      "@/_core": path.resolve(__dirname, "./src/_core"),
      "@": path.resolve(__dirname, "./src"),
      "convex/_generated": path.resolve(__dirname, "../convex/_generated"),
    },
  },
});
