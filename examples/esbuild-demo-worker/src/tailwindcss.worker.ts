import { createTailwindcss } from 'jit-browser-tailwindcss';

let tailwindcss = createTailwindcss();

self.onmessage = async (e) => {
    const { id, type, payload } = e.data;

    const postMessage = (payload?: any) => {
        self.postMessage({
            id,
            payload
        });
    }

    switch (type) {
        case "setTailwindConfig":
            tailwindcss.setTailwindConfig(payload.tailwindConfig)
            postMessage()
            break;

        case "generateStylesFromContent":
            const css = await tailwindcss.generateStylesFromContent(payload.css, payload.content)
            postMessage(css)
            break;
    
        default:
            throw new TypeError(`Worker: Invalid type ${type}`);
    }
}
