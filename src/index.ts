import postcss from 'postcss';
import processTailwindFeatures from 'tailwindcss/src/processTailwindFeatures.js';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';

export const createTailwindcss: typeof import('..').createTailwindcss = (
  { tailwindConfig } = {},
) => {

  let currentTailwindConfig = tailwindConfig;

  return {
    setTailwindConfig(newTailwindConfig) {
      currentTailwindConfig = newTailwindConfig;
    },

    async generateStylesFromContent(css, content) {
      const tailwindcssPlugin = createTailwindcssPlugin({ tailwindConfig: currentTailwindConfig, content });
      const processor = postcss([tailwindcssPlugin]);
      const result = await processor.process(css, { from: undefined });
      return result.css;
    }
  }
};

export const createTailwindcssPlugin: typeof import('..').createTailwindcssPlugin = ({ tailwindConfig, content: contentCollection }) => {
  const config = resolveConfig(tailwindConfig ?? {});
  const tailwindcssPlugin = processTailwindFeatures(
    (processOptions) => () => processOptions.createContext(
      config,
      contentCollection.map((content) => (typeof content === 'string' ? { content } : content))
    ),
  );
  return tailwindcssPlugin;
}

export const jitBrowserTailwindcss: typeof import('..').default = (tailwindMainCss, jitContent, userTailwindConfig = {}) => {
  const tailwindcss = createTailwindcss({tailwindConfig: userTailwindConfig})
  return tailwindcss.generateStylesFromContent(tailwindMainCss, [jitContent])
}

export default jitBrowserTailwindcss;
