import { createTailwindcss, createTailwindcssPlugin, jitBrowserTailwindcss } from './index';

if (typeof window !== 'undefined') {
    window.jitBrowserTailwindcss = jitBrowserTailwindcss;
    window.createTailwindcss = createTailwindcss;
    window.createTailwindcssPlugin = createTailwindcssPlugin;
}
