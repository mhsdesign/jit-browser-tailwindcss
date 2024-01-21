// import {createTailwindcss} from "@mhsdesign/jit-browser-tailwindcss";
import {createTailwindcss} from "../../../dist/module.esm";

test('simple style', async () => {

  const tailwind = createTailwindcss({
    tailwindConfig: {
        // disable normalize css
        corePlugins: { preflight: false }
    }
  })

  const htmlContent = `
    <div class="bg-red-100"></div>
  `;

  /* without the "@tailwind base;" */
  const css = await tailwind.generateStylesFromContent(`@tailwind components; @tailwind utilities;`, [htmlContent])

  expect(css).toBe(`.bg-red-100 {
    --tw-bg-opacity: 1;
    background-color: rgb(254 226 226 / var(--tw-bg-opacity))
}`);
});

test('tailwind base', async () => {
  const tailwind = createTailwindcss({
    tailwindConfig: {
        // disable normalize css
        corePlugins: { preflight: false }
    }
  })

  const css = await tailwind.generateStylesFromContent(`@tailwind base;`, [''])

  expect(css).toContain('*, ::before, ::after {');
});


test('jit custom color', async () => {

  const tailwind = createTailwindcss({
    tailwindConfig: {
        // disable normalize css
        corePlugins: { preflight: false }
    }
  })

  const htmlContent = `
    <div class="bg-[#3f3524]"></div>
  `;

  /* without the "@tailwind base;" */
  const css = await tailwind.generateStylesFromContent(`@tailwind components; @tailwind utilities;`, [htmlContent])

  expect(css).toBe(`.bg-\\[\\#3f3524\\] {
    --tw-bg-opacity: 1;
    background-color: rgb(63 53 36 / var(--tw-bg-opacity))
}`);
});

test('jit chained modifiers', async () => {

  const tailwind = createTailwindcss({
    tailwindConfig: {
        // disable normalize css
        corePlugins: { preflight: false }
    }
  })

  const htmlContent = `
    <div class="focus:hover:md:w-full"></div>
  `;

  /* without the "@tailwind base;" */
  const css = await tailwind.generateStylesFromContent(`@tailwind components; @tailwind utilities;`, [htmlContent])

  expect(css).toBe(`@media (min-width: 768px) {
    .focus\\:hover\\:md\\:w-full:hover:focus {
        width: 100%
    }
}`);
})

test('custom config', async () => {

  const tailwind = createTailwindcss({
    tailwindConfig: {
        // disable normalize css
        corePlugins: { preflight: false },
        theme: {
          extend: {
            colors: {
              marcherry: 'red',
            },
          },
        },
    },
  })

  const htmlContent = `
    <div class="bg-marcherry"></div>
  `;

  /* without the "@tailwind base;" */
  const css = await tailwind.generateStylesFromContent(`@tailwind components; @tailwind utilities;`, [htmlContent])

  expect(css).toBe(`.bg-marcherry {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}`);
});

test('media queries', async () => {

  const tailwind = createTailwindcss({
    tailwindConfig: {
        // disable normalize css
        corePlugins: { preflight: false },
    },
  })

  const htmlContent = `
    <div class="lg:py-12"></div>
  `;

  /* without the "@tailwind base;" */
  const css = await tailwind.generateStylesFromContent(`@tailwind components; @tailwind utilities;`, [htmlContent])

  expect(css).toBe(`@media (min-width: 1024px) {
    .lg\\:py-12 {
        padding-top: 3rem;
        padding-bottom: 3rem
    }
}`);
});
