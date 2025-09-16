import type { IInvokeRequest } from "@lambda-visualizer/types";
import { describe, expect, it } from "vitest";
import QueueService from "../src/queue-service";

describe("Queue Service", () => {
    const request: IInvokeRequest = {
        WaitSeconds: 0,
        DoError: false,
        DoPanic: false,
        AwsRequestId: "uuid",
    };

    it("should push and poll an item", async () => {
        const queue = new QueueService();

        await queue.push(request);
        const result = await queue.poll();

        expect(result).toEqual(request);
    });

    it("should return undefined when polling an empty queue", async () => {
        const queue = new QueueService();
        const result = await queue.poll();

        expect(result).toBeUndefined();
    });

    it("should resolve longPoll immediately if item exists", async () => {
        const queue = new QueueService();

        await queue.push(request);
        const result = await queue.longPoll();

        expect(result).toEqual(request);
    });

    it("should wait in longPoll and resolve when item is pushed", async () => {
        const queue = new QueueService();
        const longPollPromise = queue.longPoll();

        // simulate async push
        setTimeout(async () => {
            await queue.push(request);
        }, 50);

        const result = await longPollPromise;
        expect(result).toEqual(request);
    });

    it("should reject longPoll if aborted", async () => {
        const queue = new QueueService();
        const controller = new AbortController();

        const longPollPromise = queue.longPoll(controller.signal);

        setTimeout(() => {
            controller.abort();
        }, 50);

        await expect(longPollPromise).rejects.toThrow("Aborted");
    });
});

describe("QueueService - concurrent behavior", () => {
    const request: IInvokeRequest = {
        WaitSeconds: 0,
        DoError: false,
        DoPanic: false,
        AwsRequestId: "uuid",
    };

    it("should allow multiple longPolls to receive items in order", async () => {
        const queue = new QueueService();
        const requests: IInvokeRequest[] = Array.from(
            { length: 3 },
            (_, i) => ({ ...request, WaitSeconds: i })
        );

        // Start multiple longPolls before pushing items
        const longPolls = [
            queue.longPoll(),
            queue.longPoll(),
            queue.longPoll(),
        ];

        // Push items asynchronously
        setTimeout(async () => {
            for (const req of requests) {
                await queue.push(req);
            }
        }, 50);

        const results = await Promise.all(longPolls);
        expect(results).toEqual(requests);
    });

    it("should handle longPoll resolving correctly when queue already has items", async () => {
        const queue = new QueueService();
        const requests: IInvokeRequest[] = Array.from(
            { length: 2 },
            (_, i) => ({ ...request, WaitSeconds: i })
        );

        // Pre-fill the queue
        for (const req of requests) {
            await queue.push(req);
        }

        // Start multiple longPolls
        const results = await Promise.all([queue.longPoll(), queue.longPoll()]);

        expect(results).toEqual(requests);
    });

    it("should not lose items when multiple pushes and polls happen concurrently", async () => {
        const queue = new QueueService();
        const requests: IInvokeRequest[] = Array.from(
            { length: 5 },
            (_, i) => ({ ...request, WaitSeconds: i })
        );

        // Start longPolls for first 3 items
        const longPolls = [
            queue.longPoll(),
            queue.longPoll(),
            queue.longPoll(),
        ];

        // Push all 5 items asynchronously
        setTimeout(async () => {
            for (const req of requests) {
                await queue.push(req);
            }
        }, 50);

        const results = await Promise.all(longPolls);

        // First 3 should match the first 3 pushed items
        expect(results).toEqual(requests.slice(0, 3));

        // Poll the remaining 2 items
        const remaining1 = await queue.poll();
        const remaining2 = await queue.poll();

        expect([remaining1, remaining2]).toEqual(requests.slice(3));
    });

    it("should reject multiple longPolls if aborted concurrently", async () => {
        const queue = new QueueService();
        const controller1 = new AbortController();
        const controller2 = new AbortController();

        const lp1 = queue.longPoll(controller1.signal);
        const lp2 = queue.longPoll(controller2.signal);

        setTimeout(() => {
            controller1.abort();
            controller2.abort();
        }, 50);

        await expect(lp1).rejects.toThrow("Aborted");
        await expect(lp2).rejects.toThrow("Aborted");
    });
});
