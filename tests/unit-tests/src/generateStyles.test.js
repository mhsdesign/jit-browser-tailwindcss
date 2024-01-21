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
