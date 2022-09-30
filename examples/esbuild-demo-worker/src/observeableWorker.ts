
let messageCount = 0;

export const createMessenger = (worker: Worker) => {
    return (type: string, payload: any): Promise<any> => {
        const id = messageCount++;
        const responseFromWorker = new Promise((resolve) => {
            const listener = (e: MessageEvent) => {
                if (e.data.id !== id) {
                    return;
                }
                worker.removeEventListener("message", listener)
                resolve(e.data.payload)
            }
            worker.addEventListener("message", listener)
        })
        worker.postMessage({
            id,
            type,
            payload
        });
        return responseFromWorker;
    }
}
