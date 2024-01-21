import {jitBrowserTailwindcss} from "../../../dist/module.esm";

test('legacy api is exported', () => {
  expect(typeof jitBrowserTailwindcss).toBe("function");
});

test('legacy api works', async () => {
    const css = await jitBrowserTailwindcss(`@tailwind components; @tailwind utilities;`, 'bg-red-100');
    expect(css).toContain(`.bg-red-100`)
});
