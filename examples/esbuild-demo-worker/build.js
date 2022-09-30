import { build, serve as esbuildServe } from 'esbuild';

const outputDir = 'dist';

/**
 * Todo or implement something like https://github.com/evanw/esbuild/issues/802#issuecomment-955776480
 *
 * @param {import ('esbuild').BuildOptions} opts esbuild options
 */
function serve(opts) {
  esbuildServe({ servedir: outputDir, host: '127.0.0.1'}, opts)
    .then((result) => {
      const { host, port } = result;
      console.log(`open: http://${host}:${port}/index.html`);
    });
}

// Build the worker
build({
  entryPoints: {
    'tailwindcss.worker': 'src/tailwindcss.worker.ts',
  },
  outdir: outputDir,
  format: 'iife',
  bundle: true,
  minify: true,
  watch: true
});

// Change this to `build()` for building.
serve({
  minify: true,
  entryPoints: ['src/index.ts', 'src/index.html'],
  bundle: true,
  logLevel: 'info',
  format: 'esm',
  outdir: outputDir,
  loader: {
    '.html': 'copy',
  },
});
