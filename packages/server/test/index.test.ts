import type {
    IClientInvokeRequest,
    ILambdaResponse,
    ILambdaSuccessResponse,
    IRunningInstances,
} from "@lambda-visualizer/types";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/index.js";

describe("Health Checks", () => {
    it("Health Check Responds with 200", async () => {
        await request(app)
            .get("/health-check")
            .expect("Content-Type", /json/)
            .expect(200);
    });

    it("Wildcard Responds with page", async () => {
        const routes = ["/", "/invoke", "/instances"];
        for (const route of routes) {
            await request(app).get(route).expect(200);
        }
    });
});

describe("Invoke Flow", () => {
    it("Calls /sync-invoke with invalid payload", async () => {
        await request(app).post("/sync-invoke").send({}).expect(400);
    });

    it("Calls /sync-invoke & confirms PID started / killed sucessfully", async () => {
        const agent = request.agent(app);

        const invokeRequest: IClientInvokeRequest = {
            WaitSeconds: 0,
            DoError: false,
            DoPanic: false,
        };

        const invokeResponse = await agent
            .post("/sync-invoke")
            .send(invokeRequest)
            .expect(200);
        const lambdaResponse = invokeResponse.body as ILambdaResponse;
        expect(lambdaResponse).not.toHaveProperty("errorType");
        const { PID } = lambdaResponse as ILambdaSuccessResponse;

        const listInstancesResponse = await agent
            .get("/api/instances")
            .expect(200);
        const runningInstances =
            listInstancesResponse.body as IRunningInstances;
        expect(runningInstances).toHaveLength(1);
        expect(runningInstances).toContain(PID);

        await agent.delete(`/api/instances/${PID}`).expect(204);

        const listInstancesPostDeleteResponse = await agent
            .get("/api/instances")
            .expect(200);
        const runningInstancesPostDelete =
            listInstancesPostDeleteResponse.body as IRunningInstances;
        expect(runningInstancesPostDelete).toHaveLength(0);
    });

    it("Calls /sync-invoke & expects multiple instances to start", async () => {
        const agent = request.agent(app);

        const invokeResponseSlow = agent
            .post("/sync-invoke")
            .send({
                WaitSeconds: 2,
                DoError: false,
                DoPanic: false,
            })
            .expect(200);

        const invokeResponseFast = agent
            .post("/sync-invoke")
            .send({
                WaitSeconds: 0,
                DoError: false,
                DoPanic: false,
            })
            .expect(200);

        await Promise.all([invokeResponseSlow, invokeResponseFast]);

        const listInstancesResponse = await agent
            .get("/api/instances")
            .expect(200);
        const runningInstances =
            listInstancesResponse.body as IRunningInstances;
        expect(runningInstances).toHaveLength(2);
    });
});
