import EventEmitter from "node:events";

import { Mutex } from "async-mutex";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";

import type {
    IClientInvokeRequest,
    IInvokeRequest,
    ILambdaResponse,
} from "@lambda-visualizer/types";

import { logger } from "./logging.js";
import PlacementService from "./placement-service.js";
import QueueService from "./queue-service.js";

export default class InvokeService {
    private inFlightRequests: number;
    private emitter: EventEmitter;
    private mutex: Mutex;

    constructor(
        private placement: PlacementService,
        private queue: QueueService
    ) {
        this.inFlightRequests = 0;
        this.emitter = new EventEmitter();
        this.mutex = new Mutex();
    }

    public async syncInvoke(
        request: IClientInvokeRequest
    ): Promise<ILambdaResponse> {
        const invokeRequest: IInvokeRequest = {
            AwsRequestId: uuidv4(),
            ...request,
        };

        logger.info(
            chalk.blueBright(
                `:computer: User Called Sync Invoke. Request ID: ${invokeRequest.AwsRequestId}`
            )
        );

        await Promise.all([
            this.queue.push(invokeRequest),
            this.incrementInFlightRequests(1),
        ]);

        if (this.inFlightRequests > this.placement.getInstanceCount()) {
            this.placement.createInstance();
        }

        return new Promise((resolve) => {
            this.emitter.once(
                `response-${invokeRequest.AwsRequestId}`,
                (response) => {
                    this.incrementInFlightRequests(-1);
                    resolve(response);
                }
            );
        });
    }

    public async next(signal?: AbortSignal) {
        logger.info(
            chalk.magenta(":hourglass: Lambda Runtime Polled For Event")
        );

        const event = await this.queue.longPoll(signal);

        logger.debug(
            chalk.gray(`Sending event to Lambda Runtime ${event.AwsRequestId}`)
        );

        return event;
    }

    public reportSuccess(awsRequestId: string, response: any) {
        logger.info(
            chalk.green(
                `:white_check_mark: Lambda Runtime reported success. Request ID: ${awsRequestId}`
            )
        );

        this.emitter.emit(`response-${awsRequestId}`, response);
    }

    public reportError(awsRequestId: string, response: any) {
        logger.info(
            chalk.red(
                `:x: Lambda Runtime reported error. Request ID: ${awsRequestId}`
            )
        );

        this.emitter.emit(`response-${awsRequestId}`, response);
    }

    private async incrementInFlightRequests(delta: number) {
        return this.mutex.runExclusive(() => {
            this.inFlightRequests += delta;
        });
    }
}
