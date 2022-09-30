type WorkerMessageObserver = {
    subscribe(listerner: (e: MessageEvent) => void): void;
    unsubscribe(listerner: (e: MessageEvent) => void): void;
}

export const fromWorkerMessageEvent = (worker: Worker): WorkerMessageObserver => {
    const subscribers = new Set<((e: MessageEvent) => void)>()
    worker.addEventListener('message', (e) => subscribers.forEach(subscriber => subscriber(e)))
    return {
        subscribe: subscribers.add.bind(subscribers),
        unsubscribe: subscribers.delete.bind(subscribers),
    }
}

export const createMessenger = (worker: Worker, worker$: WorkerMessageObserver) => {
    let messageCount = 0;
    return (type: string, payload: any): Promise<any> => {
        const id = messageCount++;
        const result = new Promise((resolve) => {
            const listener = (e: MessageEvent) => {
                if (e.data.id !== id) {
                    return;
                }
                worker$.unsubscribe(listener)
                resolve(e.data.payload)
            }
            worker$.subscribe(listener)
        })
        worker.postMessage({
            id,
            type,
            payload
        });
        return result;
    }
}
