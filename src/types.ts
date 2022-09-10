import { TailwindcssOptions } from 'jit-browser-tailwindcss';
import { Postcss } from 'postcss';
import parse from 'postcss-selector-parser';
import expandApplyAtRules from 'tailwindcss/src/lib/expandApplyAtRules.js';
import { generateRules } from 'tailwindcss/src/lib/generateRules.js';
import {
  ChangedContent,
  createContext,
  JitContext,
} from 'tailwindcss/src/lib/setupContextUtils.js';
import { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';

export interface MessageWithIdentifier {
  identifier: number;
}

export interface InitializeRequest extends MessageWithIdentifier {
  type: 'INITIALIZE';
  workerConfig: TailwindcssOptions;
}

export type InitializeResponse = MessageWithIdentifier;

export interface GenerateStylesFromContentRequest extends MessageWithIdentifier {
  type: 'GENERATE_STYLES_FROM_CONTENT';
  css: string;
  content: ChangedContent[];
}

export interface GenerateStylesFromContentResponse extends MessageWithIdentifier {
  tailwindCss: string;
}

export interface JitState extends State {
  config: TailwindConfig;
  jitContext: JitContext;
  modules: {
    postcss: {
      version: string;
      module: Postcss;
    };
    postcssSelectorParser: {
      module: typeof parse;
    };
    jit: {
      generateRules: {
        module: typeof generateRules;
      };
      createContext: {
        module: typeof createContext;
      };
      expandApplyAtRules: {
        module: typeof expandApplyAtRules;
      };
    };
  };
}

// Tailwindcss-language-service/dist/util/state.d.ts
interface State {
  enabled: boolean;
  configPath?: string;
  configId?: string;
  config?: any;
  version?: string;
  separator?: string;
  dependencies?: string[];
  plugins?: any;
  screens?: string[];
  variants?: Record<string, string | null>;
  corePlugins?: string[];
  modules?: {
    tailwindcss?: {
      version: string;
      module: any;
    };
    postcss?: {
      version: string;
      module: Postcss;
    };
    postcssSelectorParser?: {
      module: any;
    };
    resolveConfig?: {
      module: any;
    };
    jit?: {
      generateRules: {
        module: any;
      };
      createContext: {
        module: any;
      };
      expandApplyAtRules: {
        module: any;
      };
    };
  };
  browserslist?: string[];
  featureFlags?: {
    future: string[];
    experimental: string[];
  };
  jit?: boolean;
  jitContext?: any;
  pluginVersions?: string;
}
