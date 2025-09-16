import EventEmitter from "node:events";

import { Mutex } from "async-mutex";
import Denque from "denque";

import type { IInvokeRequest } from "@lambda-visualizer/types";

export default class QueueService {
    private queue: Denque<IInvokeRequest>;
    private emitter: EventEmitter;
    private mutex: Mutex;

    constructor() {
        this.queue = new Denque();
        this.emitter = new EventEmitter();
        this.mutex = new Mutex();
    }

    public async push(request: IInvokeRequest) {
        await this.mutex.runExclusive(() => {
            this.queue.push(request);
            this.emitter.emit("invoke-request");
        });
    }

    public async poll(): Promise<IInvokeRequest | undefined> {
        const release = await this.mutex.acquire();

        try {
            const item = this.queue.shift();
            return item;
        } finally {
            release();
        }
    }

    public async longPoll(signal?: AbortSignal): Promise<IInvokeRequest> {
        const immediateItem = await this.poll();
        if (immediateItem) {
            return immediateItem;
        }

        if (signal?.aborted) {
            throw new Error("Poll Aborted");
        }

        return new Promise<IInvokeRequest>((resolve, reject) => {
            const handleRequest = async () => {
                cleanup();

                const item = await this.poll();
                if (item) {
                    resolve(item);
                } else {
                    // Re-add the listener if somehow the queue is empty (edge case)
                    this.emitter.once("invoke-request", handleRequest);
                    signal?.addEventListener("abort", onAbort, { once: true });
                }
            };

            const onAbort = () => {
                cleanup();
                reject(new Error("Aborted"));
            };

            const cleanup = () => {
                this.emitter.removeListener("invoke-request", handleRequest);
                signal?.removeEventListener("abort", onAbort);
            };

            this.emitter.once("invoke-request", handleRequest);
            signal?.addEventListener("abort", onAbort, { once: true });
        });
    }
}
