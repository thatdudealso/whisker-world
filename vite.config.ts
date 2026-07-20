import { defineConfig } from "vite";

// Production host path will be /whisker-world/ on 5432wire.com.
// Local dev uses base '/' so assets resolve at the Vite root.
export default defineConfig({
  base: "/",
  // When building for 5432wire.com/whisker-world, set base: "/whisker-world/"
  // (or via env) before `npm run build`.
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
