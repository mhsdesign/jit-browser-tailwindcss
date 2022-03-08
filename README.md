# browser jit generate tailwindcss

lower level extraction fork of https://github.com/beyondcode/tailwindcss-jit-cdn

that uses Tailwind 3 and is build with Webpack directly (Webpack 4 to auto include node polyfills)

the purpose is to have an api in the browser to interact directly with tailwind jit generation.

this is possible by this global function:

```js
browserJitGenerateTailwindcss(/** @type string */ tailwindMainCss, /** @type string */ jitContent, /** @type object */ userTailwindConfig = {});
```

## Usage:

see demo file

the bundle size is minified around 467 KiB
