import { TailwindConfig, tailwindcssFactory } from 'jit-browser-tailwindcss';

const workerFactory = (): Worker =>
  new Worker(new URL('tailwindcss.worker.js', import.meta.url).pathname);

const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {
      colors: {
        marcherry: 'red',
      },
    },
  },
};

const tailwindCss = tailwindcssFactory(workerFactory, { tailwindConfig });

const contentElements = document.querySelectorAll('[data-dynamic-tailwind-css]');

const content = Array.from(contentElements).reduce((carry, el) => carry + el.outerHTML, '');

const css = await tailwindCss.generateStylesFromContent(
  `
@tailwind base;
@tailwind components;
@tailwind utilities;
`,
  [content],
);

const style = document.getElementById('tailwind')!;
style.textContent = css;

await new Promise((r) => setTimeout(r, 1000));

tailwindCss.setTailwindConfig({
  theme: {
    extend: {
      colors: {
        marcherry: 'blue',
      },
    },
  },
});

style.textContent = await tailwindCss.generateStylesFromContent(
  `
@tailwind base;
@tailwind components;
@tailwind utilities;
`,
  [content],
);
