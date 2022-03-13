# @mhsdesign/jit-browser-tailwindcss

## Still in @beta

Client side api to generate css via tailwind jit in the browser - Dynamic tailwindcss!

![image](https://user-images.githubusercontent.com/85400359/157231070-2de5d2ad-c852-40db-92dd-09d7171990bb.png)

fork / lower level extraction of https://github.com/beyondcode/tailwindcss-jit-cdn
(that uses Tailwind 3 and is build with Webpack directly (Webpack 4 to auto include node polyfills))

the purpose is to have an api in the browser to interact directly with tailwind jit generation.

## Use cases
this plugin was developed to make dynamic html content elements from a CMS usable with tailwind classes. So one should already have a tailwind build and css file at hand - any further css can then be generated via this package. To have the least amount of css duplication, the generated css of this package doesn't include normalize css. For this use case, this package is best used without the `@base` include:

```js
const css = await window.browserJitGenerateTailwindcss(`
    // remove this line: @tailwind base;
    @tailwind components;
    @tailwind utilities;
`, content)
```


## How to use:

### in another package

```shell
npm install @mhsdesign/jit-browser-tailwindcss
```

```js
import jitBrowserTailwindcss from '@mhsdesign/jit-browser-tailwindcss'; // the dist version will be used.

jitBrowserTailwindcss(/** @type string */ tailwindMainCss, /** @type string */ jitContent, /** @type object */ userTailwindConfig = {});
```

#### dynamic:

```js
// use this for fancy webpack code splitting etc
const {default: jitBrowserTailwindcss} = import('@mhsdesign/jit-browser-tailwindcss');

jitBrowserTailwindcss(/** @type string */ tailwindMainCss, /** @type string */ jitContent, /** @type object */ userTailwindConfig = {});
```

### directly in the browser

just load the dist/main.js script and youre good to go - there will be an `export` on the `window` waiting for you ;)

```html
<script src="./dist/main.js"></script>

<script>
    window.jitBrowserTailwindcss(/** @type string */ tailwindMainCss, /** @type string */ jitContent, /** @type object */ userTailwindConfig = {});
</script>
```

#### dynamic:

```html
<script>

    (async () => {
        await import('../dist/main.js'); // dont bother to use the result - currently its useless in the browser.
        window.jitBrowserTailwindcss(/** @type string */ tailwindMainCss, /** @type string */ jitContent, /** @type object */ userTailwindConfig = {});

    })()
    
</script>
```


```js
// generate only the minimum css without duplication (must be used with a proper tailwind build together:)
const css = await window.browserJitGenerateTailwindcss(`
    @tailwind components;
    @tailwind utilities;
`, '<div class="bg-red-100"></div>')
```

## examples:

see demo file

## notes

the bundle size is minified around 489 KiB
