import { build } from "esbuild";

build({
  entryPoints: ['src/index.ts', 'src/index.html'],
    minify: true,
    bundle: true,
    logLevel: 'info',
    format: 'iife',
    outdir: 'dist',
    loader: {
      '.html': 'copy',
    }
})
