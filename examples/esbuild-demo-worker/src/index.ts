import { TailwindConfig, Tailwindcss } from 'jit-browser-tailwindcss';
import { fromEvent, lastValueFrom, map, filter, take } from "rxjs";

const worker = new Worker(new URL('tailwindcss.worker.js', import.meta.url).pathname);

const worker$ = fromEvent<MessageEvent>(worker, "message")

let messageCount = 0;

const postMessage = (type: string, payload: any): Promise<any> => {
  const id = messageCount++;
  const result$ = worker$.pipe(
    filter(msg => msg.data.id === id),
    map(msg => msg.data.payload),
    take(1)
  )
  const result = lastValueFrom(result$)
  worker.postMessage({
    id,
    type,
    payload
  });
  return result;
}

const tailwindcss: Tailwindcss = {
  async setTailwindConfig(tailwindConfig) {
    await postMessage("setTailwindConfig", { tailwindConfig })
  },
  async generateStylesFromContent(css, content) {
    return postMessage("generateStylesFromContent", { css, content })
  }
}

const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {
      colors: {
        marcherry: 'red',
      },
    },
  },
};

tailwindcss.setTailwindConfig(tailwindConfig);

const contentElements = document.querySelectorAll('[data-dynamic-tailwind-css]');

const content = Array.from(contentElements).reduce((carry, el) => carry + el.outerHTML, '');

const css = await tailwindcss.generateStylesFromContent(
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

tailwindcss.setTailwindConfig({
  theme: {
    extend: {
      colors: {
        marcherry: 'blue',
      },
    },
  },
});

style.textContent = await tailwindcss.generateStylesFromContent(
  `
@tailwind base;
@tailwind components;
@tailwind utilities;
`,
  [content],
);
