import {writeFileSync} from 'fs';
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const VIRTUAL_SOURCE_PATH = '/sourcePath';
const VIRTUAL_HTML_FILENAME = '/htmlInput';

export default async (/** @type string */ tailwindMainCss, /** @type string */ jitContent, /** @type object */ userTailwindConfig = {}) => {

    writeFileSync(VIRTUAL_HTML_FILENAME, jitContent);

    const defaultTailwindConfig = {
        mode: 'jit',
        content: [VIRTUAL_HTML_FILENAME],
        corePlugins: {preflight: false}
    };

    const tailwindConfig = {
        ...userTailwindConfig,
        ...defaultTailwindConfig
    };

    const {css} = await postcss([
        tailwindcss(tailwindConfig)
    ]).process(tailwindMainCss, {
        from: VIRTUAL_SOURCE_PATH,
    });

    return css;
};
