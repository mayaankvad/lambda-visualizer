import type {
    IClientInvokeRequest,
    ILambdaResponse,
    ILambdaSuccessResponse,
} from "@lambda-visualizer/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type IInvokeRecord = {
    request: IClientInvokeRequest;
    response: ILambdaResponse;

    startTime: Date;
    endTime: Date;

    PID: number;
    Count: number;
    AwsRequestId: string;
};

interface AppState {
    invocations: Array<IInvokeRecord>;
    clear: () => void;
    recordInvocation: (
        request: IInvokeRecord["request"],
        response: IInvokeRecord["response"],
        context: { startTime: Date; endTime: Date }
    ) => void;
}

const storage = createJSONStorage<AppState>(() => localStorage, {
    reviver: (key, value: any) => {
        if (key.includes("Time")) {
            return new Date(value);
        }
        return value;
    },
    replacer: (_key, value) => {
        return value;
    },
});

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            invocations: [],

            clear: () =>
                set(() => {
                    return {
                        invocations: [],
                    };
                }),

            recordInvocation: (request, response, context) =>
                set((state) => {
                    const parsedResponse = parseResponse(response);

                    const invocationRecord: IInvokeRecord = {
                        request,
                        response,
                        ...parsedResponse,
                        ...context,
                    };

                    state.invocations.push(invocationRecord);

                    return { ...state };
                }),
        }),
        { name: "lambda-visualizer", storage }
    )
);

function parseResponse(raw: ILambdaResponse): ILambdaSuccessResponse {
    if (!("errorType" in raw)) {
        return raw;
    }

    return JSON.parse(raw.errorMessage) as ILambdaSuccessResponse;
}
