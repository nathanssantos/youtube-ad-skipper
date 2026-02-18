import esbuild from "esbuild";

const shared = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: "chrome120",
};

await Promise.all([
  esbuild.build({
    ...shared,
    entryPoints: ["src/content/content.ts"],
    outfile: "dist/content.js",
    format: "iife",
  }),
  esbuild.build({
    ...shared,
    entryPoints: ["src/background/service-worker.ts"],
    outfile: "dist/service-worker.js",
    format: "iife",
  }),
  esbuild.build({
    ...shared,
    entryPoints: ["src/popup/popup.ts"],
    outfile: "dist/popup.js",
    format: "iife",
  }),
]);
