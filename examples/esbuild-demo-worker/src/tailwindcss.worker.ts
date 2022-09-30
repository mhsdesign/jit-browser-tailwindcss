import { createTailwindcss } from 'jit-browser-tailwindcss';

let tailwindcss = createTailwindcss();

self.onmessage = async (e) => {
    const { id, type, payload } = e.data;
    switch (type) {
        case "setTailwindConfig":
            tailwindcss.setTailwindConfig(payload.tailwindConfig)

            self.postMessage({
                id
            });
            
            break;

        case "generateStylesFromContent":
            const css = await tailwindcss.generateStylesFromContent(payload.css, payload.content)

            self.postMessage({
                id,
                payload: css
            });
            
            break;
    
        default:
            throw new TypeError(`Worker: Invalid type ${type}`);
    }
}
