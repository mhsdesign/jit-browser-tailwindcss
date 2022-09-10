import esbuild from 'esbuild';

const outputDir = 'dist';

/**
 * @param {import ('esbuild').BuildOptions} opts esbuild options
 */
function build(opts) {
  esbuild.build(opts).then((result) => {
    if (result.errors.length > 0) {
      console.error(result.errors);
    }
    if (result.warnings.length > 0) {
      console.error(result.warnings);
    }
    console.info('build done');
  });
}

/**
 * Todo or implement something like https://github.com/evanw/esbuild/issues/802#issuecomment-955776480
 *
 * @param {import ('esbuild').BuildOptions} opts esbuild options
 */
function serve(opts) {
  esbuild
    .serve(
      {
        servedir: outputDir,
        host: '127.0.0.1',
      },
      opts,
    )
    .then((result) => {
      const { host, port } = result;
      console.info('serve done');
      console.log(`open: http://${host}:${port}/index.html`);
    });
}

// Build the workers
build({
  entryPoints: {
    // 'tailwindcss.worker': require.resolve('jit-browser-tailwindcss/tailwindcss.worker.js')
    'tailwindcss.worker': 'src/tailwindcssplugin.worker.ts',
  },
  outdir: outputDir,
  format: 'iife',
  bundle: true,
  minify: true,
  watch: true,
  loader: {
    '.css': 'text',
  },
});

// Change this to `build()` for building.
serve({
  minify: false,
  entryPoints: ['src/index.ts', 'src/index.html'],
  bundle: true,
  logLevel: 'info',
  format: 'esm',
  outdir: outputDir,
  loader: {
    '.html': 'copy',
  },
});
