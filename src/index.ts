import { TailwindcssWorker } from './tailwindcss.worker.js';
import {
  GenerateStylesFromContentRequest,
  GenerateStylesFromContentResponse,
  InitializeRequest,
  InitializeResponse,
  MessageWithIdentifier,
} from './types.js';

function isObjectEmptyOrKeyNullthy(obj: Record<string, any>): boolean {
  for (const x in obj) {
    if (obj[x] == null) {
      continue;
    }
    return false;
  }
  return true;
}

export const tailwindcssFactory: typeof import('jit-browser-tailwindcss').tailwindcssFactory = (
  tailwindWorkerFactory,
  { tailwindConfig } = {},
) => {
  let workerConfig = { tailwindConfig };

  let webWorkerMessageIdentifier = 0;

  let webWorkerApi: Worker | undefined;

  const webWorkerResolver = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
    }
  >();

  const workerOnEvent = (event: MessageEvent<MessageWithIdentifier>) => {
    webWorkerResolver.get(event.data.identifier)!.resolve(event.data);
    webWorkerResolver.delete(event.data.identifier);
  };

  const stopWorker = (): void => {
    if (webWorkerApi) {
      webWorkerApi.terminate();
      for (const { reject } of webWorkerResolver.values()) {
        reject(new Error('Worker has been stopped.'));
      }
      webWorkerResolver.clear();
      webWorkerApi.removeEventListener('message', workerOnEvent);
      webWorkerApi = undefined;
    }
  };

  const workerApiCall = <
    Request extends MessageWithIdentifier,
    Response extends MessageWithIdentifier,
  >(
    request: Request,
  ): Promise<Response> => {
    webWorkerApi!.postMessage(request);
    return new Promise((resolve, reject) => {
      webWorkerResolver.set(request.identifier, {
        resolve,
        reject,
      });
    });
  };

  const getTailwindCssWorker = async (): Promise<TailwindcssWorker> => {
    if (!webWorkerApi) {
      webWorkerApi = tailwindWorkerFactory();
      webWorkerApi.addEventListener('message', workerOnEvent);

      if (!isObjectEmptyOrKeyNullthy(workerConfig)) {
        await workerApiCall<InitializeRequest, InitializeResponse>({
          identifier: ++webWorkerMessageIdentifier,
          type: 'INITIALIZE',
          workerConfig,
        });
      }
    }

    return {
      async generateStylesFromContent(css, content) {
        const { tailwindCss } = await workerApiCall<
          GenerateStylesFromContentRequest,
          GenerateStylesFromContentResponse
        >({
          identifier: ++webWorkerMessageIdentifier,
          type: 'GENERATE_STYLES_FROM_CONTENT',
          css,
          content,
        });
        return tailwindCss;
      },
    };
  };

  return {
    dispose() {
      stopWorker();
    },

    setTailwindConfig(newTailwindConfig) {
      stopWorker();
      workerConfig = { ...workerConfig, tailwindConfig: newTailwindConfig };
    },

    async generateStylesFromContent(css, contents) {
      const tailwindCssWorker = await getTailwindCssWorker();
      return tailwindCssWorker.generateStylesFromContent(
        css,
        contents.map((content) => (typeof content === 'string' ? { content } : content)),
      );
    },
  };
};
