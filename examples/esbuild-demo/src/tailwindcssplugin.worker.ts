import lineClamp from '@tailwindcss/line-clamp';
import typography from '@tailwindcss/typography';
import { initialize } from 'jit-browser-tailwindcss/tailwindcss.worker.js';

initialize({
  prepareTailwindConfig(tailwindConfig) {
    if (typeof tailwindConfig === 'string') {
      throw new TypeError('Not implemented.');
    }

    const plugins = [typography, lineClamp];
    return { ...tailwindConfig, plugins };
  },
});
