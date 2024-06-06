import { readdir, readFile } from 'fs/promises';
import { parse, sep } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const pkg = JSON.parse(await readFile(new URL('package.json', import.meta.url)));
const externalDependenciesHack = ['@tailwindcss/oxide'];

/**
 * @type {import("esbuild").BuildOptions}
 */
 const sharedConfig = {
  define: {
    'process.env.OXIDE': 'undefined',
    'process.env.DEBUG': 'undefined',
    'process.env.JEST_WORKER_ID': '1',
    '__OXIDE__': 'false',
    __dirname: '"/"',
  },
  plugins: [
    {
      name: 'alias',
      async setup({ onLoad, onResolve, resolve }) {
        const stubFiles = await readdir('src/stubs', { withFileTypes: true });
        // These packages are imported, but can be stubbed.
        const stubNames = stubFiles
          .filter((file) => file.isFile())
          .map((file) => parse(file.name).name);
        onResolve({ filter: new RegExp(`^(${stubNames.join('|')})$`) }, ({ path }) => ({
          path: fileURLToPath(new URL(`src/stubs/${path}.ts`, import.meta.url)),
          sideEffects: false,
        }));

        // The tailwindcss main export exports CJS, but we can get better tree shaking if we import
        // from the ESM src directoy instead.
        onResolve({ filter: /^tailwindcss$/ }, ({ path, ...options }) =>
          resolve('tailwindcss/src', options),
        );
        onResolve({ filter: /^tailwindcss\/lib/ }, ({ path, ...options }) =>
          resolve(path.replace('lib', 'src'), options),
        );

        // This file pulls in a number of dependencies, but we don’t really need it anyway.
        onResolve({ filter: /^\.+\/(util\/)?log$/, namespace: 'file' }, ({ path, ...options }) => {
          if (options.importer.includes(`${sep}tailwindcss${sep}`)) {
            return {
              path: fileURLToPath(new URL('src/stubs/tailwindcss/utils/log.ts', import.meta.url)),
              sideEffects: false,
            };
          }
          return resolve(path, {
            ...options,
            sideEffects: false,
            namespace: 'noRecurse',
          });
        });

        // CJS doesn’t require extensions, but ESM does. Since our package uses ESM, but dependant
        // bundled packages don’t, we need to add it ourselves.
        onResolve({ filter: /^postcss-selector-parser\/.*\/\w+$/ }, ({ path, ...options }) =>
          resolve(`${path}.js`, options),
        );

        // minify and include the preflight.css in the javascript
        onLoad({ filter: /tailwindcss\/src\/css\/preflight\.css$/ }, async ({ path }) => {
          const result = await build({
            entryPoints: [path],
            minify: true,
            logLevel: "silent",
            write: false
          })
          return { contents: result.outputFiles[0].text, loader: "text" };
        });

        // declares all dependencies as side-effect free
        // currently no effect, disabled for faster build.
        // onResolve({ filter: /.*/, namespace: "file" }, async ({ path, ...options }) => {
        //   const result = await resolve(path, { ...options, namespace: "noRecurse"})
        //   result.sideEffects = false
        //   return result
        // })

        // Rewrite the tailwind stubs from CJS to ESM, so our bundle doesn’t need to include any CJS
        // related logic.
        onLoad({ filter: /\/tailwindcss\/stubs\/defaultConfig\.stub\.js$/ }, async ({ path }) => {
          const cjs = await readFile(path, 'utf8');
          const esm = cjs.replace('module.exports =', 'export default');
          return { contents: esm };
        });
      },
    },
  ],
}

// MODULE
await build({
  entryPoints: {'module.esm': 'builds/module.ts'},
  bundle: true,
  external: [...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }).filter(
    // We only want to include tailwindcss as an external dependency for its types.
    (name) => name !== 'tailwindcss',
  ), ...externalDependenciesHack],
  logLevel: 'info',
  outdir: 'dist',
  sourcemap: true,
  format: 'esm',
  ...sharedConfig
});

// CommonJS
await build({
  entryPoints: {'main': 'builds/module.ts'},
  bundle: true,
  external: [...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }).filter(
    // We only want to include tailwindcss as an external dependency for its types.
    (name) => name !== 'tailwindcss',
  ), ...externalDependenciesHack],
  logLevel: 'info',
  outdir: 'dist',
  sourcemap: true,
  format: 'cjs',
  ...sharedConfig
});

// CDN
await build({
  entryPoints: {'cdn.min': 'builds/cdn.js'},
  external: externalDependenciesHack,
  bundle: true,
  minify: true,
  logLevel: 'info',
  format: 'iife',
  outdir: "dist",
  ...sharedConfig
});
