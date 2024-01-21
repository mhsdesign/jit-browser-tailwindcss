// FIXME i rather want to write "@mhsdesign/jit-browser-tailwindcss" here
import {createTailwindcss, createTailwindcssPlugin} from "../../../dist/module.esm";

test('exports', () => {
  expect(typeof createTailwindcss).toBe("function");
  expect(typeof createTailwindcssPlugin).toBe("function");
});
