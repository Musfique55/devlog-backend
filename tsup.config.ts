import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app/server.ts"],
  format: ["cjs"],
  outDir: "dist",
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  shims: true,
  dts: false,
});