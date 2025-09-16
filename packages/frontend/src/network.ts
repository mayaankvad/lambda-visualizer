import type {
    IClientInvokeRequest,
    ILambdaResponse,
    IRunningInstances,
} from "@lambda-visualizer/types";
import axios from "axios";

const baseURL = import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : window.location.origin;

axios.defaults.baseURL = baseURL;

export async function syncInvoke(
    request: IClientInvokeRequest
): Promise<ILambdaResponse> {
    const { data } = await axios.post("/sync-invoke", request);
    return data;
}

export async function getRunningInstances(): Promise<IRunningInstances> {
    const { data } = await axios.get("/api/instances");
    return data;
}

export async function killInstance(pid: number) {
    await axios.delete(`/api/instances/${pid}`);
}
