import { z } from "zod";

export const ClientInvokeRequest = z.object({
    WaitSeconds: z.number().int(),
    DoError: z.boolean(),
    DoPanic: z.boolean(),
});

export type IClientInvokeRequest = z.infer<typeof ClientInvokeRequest>;

export type IInvokeRequest = IClientInvokeRequest & {
    AwsRequestId: string;
};

export type IRunningInstances = number[];

export type ILambdaSuccessResponse = {
    PID: number;
    Count: number;
    AwsRequestId: string;
};

export type ILambdaErrorResponse = {
    errorType: "errorResponse" | "panicResponse";
    errorMessage: string;
    stackTrace?: Array<{
        path: string;
        line: number;
        label: string;
    }>;
};

export type ILambdaResponse = ILambdaSuccessResponse | ILambdaErrorResponse;
