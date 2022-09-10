import { TailwindcssOptions } from 'jit-browser-tailwindcss';
import { TailwindWorkerOptions } from 'jit-browser-tailwindcss/tailwindcss.worker';
import postcss from 'postcss';
import { Config } from 'tailwindcss';
import { ChangedContent } from 'tailwindcss/src/lib/setupContextUtils.js';
import processTailwindFeatures from 'tailwindcss/src/processTailwindFeatures.js';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';

import {
  GenerateStylesFromContentRequest,
  GenerateStylesFromContentResponse,
  InitializeRequest,
  InitializeResponse,
} from './types.js';

export interface TailwindcssWorker {
  generateStylesFromContent: (css: string, content: ChangedContent[]) => Promise<string>;
}

export function initializeWorker(
  initializerFn: (options?: TailwindcssOptions) => TailwindcssWorker,
) {
  let tailwindWorker: TailwindcssWorker;

  self.onmessage = async (
    e: MessageEvent<GenerateStylesFromContentRequest | InitializeRequest>,
  ) => {
    const { identifier, type } = e.data;
    switch (type) {
      case 'INITIALIZE':
        tailwindWorker = initializerFn(e.data.workerConfig);
        self.postMessage(<InitializeResponse>{
          identifier,
        });
        break;

      case 'GENERATE_STYLES_FROM_CONTENT':
        if (!tailwindWorker) {
          tailwindWorker = initializerFn();
        }
        const tailwindCss = await tailwindWorker.generateStylesFromContent(
          e.data.css,
          e.data.content,
        );
        self.postMessage(<GenerateStylesFromContentResponse>{
          identifier,
          tailwindCss,
        });
        break;

      default:
        throw new Error(`TailwindcssWorker Request ${JSON.stringify(e.data)}`);
    }
  };
}

export function initialize(tailwindWorkerOptions?: TailwindWorkerOptions): void {
  initializeWorker((options) => {
    const preparedTailwindConfigPromise =
      tailwindWorkerOptions?.prepareTailwindConfig?.(options?.tailwindConfig) ??
      options?.tailwindConfig ??
      ({} as Config);
    if (typeof preparedTailwindConfigPromise !== 'object') {
      throw new TypeError(
        `Expected tailwindConfig to resolve to an object, but got: ${JSON.stringify(
          preparedTailwindConfigPromise,
        )}`,
      );
    }

    return {
      async generateStylesFromContent(css, content) {
        const config = resolveConfig(await preparedTailwindConfigPromise);
        const tailwind = processTailwindFeatures(
          (processOptions) => () => processOptions.createContext(config, content),
        );
        const processor = postcss([tailwind]);

        const result = await processor.process(css, { from: undefined });
        return result.css;
      },
    };
  });
}

// Side effect initialization - but this function can be called more than once. Last applies.
initialize();
