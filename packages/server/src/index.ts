import {
    ClientInvokeRequest,
    type IClientInvokeRequest,
    type IRunningInstances,
} from "@lambda-visualizer/types";
import cors from "cors";
import express, { type Request, type Response } from "express";
import path from "path";

import { PORT, WEBSITE_STATIC_DIR } from "./config.js";
import InvokeService from "./invoke-service.js";
import PlacementService from "./placement-service.js";
import QueueService from "./queue-service.js";

const queueService = new QueueService();
const placementService = new PlacementService();
const invokeService = new InvokeService(placementService, queueService);

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(WEBSITE_STATIC_DIR));

app.post(
    "/sync-invoke",
    async (request: Request<IClientInvokeRequest>, response) => {
        response.setTimeout(15 * 60 * 1000);

        const parseResult = await ClientInvokeRequest.safeParseAsync(
            request.body
        );
        if (!parseResult.success) {
            response.status(400).json(parseResult.error);
            return;
        }

        const res = await invokeService.syncInvoke(parseResult.data);
        response.json(res);
    }
);

app.get("/2018-06-01/runtime/invocation/next", async (request, response) => {
    request.setTimeout(0);

    const abortController = new AbortController();
    request.on("close", () => {
        abortController.abort();
    });

    try {
        const event = await invokeService.next(abortController.signal);
        const lambdaTimeout = new Date().valueOf() + 15 * 60 * 1000; // 15 minute timeout

        response.set({
            "Lambda-Runtime-Aws-Request-Id": event.AwsRequestId,
            "Lambda-Runtime-Deadline-Ms": lambdaTimeout,
        });

        response.json(event);
    } catch (_) {
        response
            .status(400)
            .json({ message: "Lambda Runtime was terminated mid request" });
    }
});

app.post(
    "/2018-06-01/runtime/invocation/:AwsRequestId/response",
    (request, response) => {
        invokeService.reportSuccess(request.params.AwsRequestId, request.body);
        response.status(202).send();
    }
);

app.post(
    "/2018-06-01/runtime/invocation/:AwsRequestId/error",
    (request, response) => {
        invokeService.reportError(request.params.AwsRequestId, request.body);
        response.status(202).send();
    }
);

app.get("/api/instances", (_, response: Response<IRunningInstances>) => {
    const instances = placementService.getRunningPids();
    response.json(Array.from(instances));
});

app.delete("/api/instances/:pid", async (request, response) => {
    await placementService.killInstance(Number(request.params.pid));
    response.status(204).send();
});

app.get("/health-check", (_, response) => {
    response.json({ status: "ok" });
});

app.get("/*splat", (_, res) => {
    res.sendFile(path.join(WEBSITE_STATIC_DIR, "index.html"));
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on :${PORT}`);
});
