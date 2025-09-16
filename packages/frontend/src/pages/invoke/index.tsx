import { useState } from "react";

import { CodeView } from "@cloudscape-design/code-view";
import jsonHighlight from "@cloudscape-design/code-view/highlight/json";
import {
    Alert,
    AlertProps,
    Button,
    ContentLayout,
    Flashbar,
    FlashbarProps,
    Header,
} from "@cloudscape-design/components";
import type {
    IClientInvokeRequest,
    ILambdaResponse,
} from "@lambda-visualizer/types";
import { useMutation } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";
import { syncInvoke } from "../../network";
import { useStore } from "../../store/useStore";
import CodeEditorView from "./CodeEditorView";

type Response = {
    status: "PENDING" | "SUCCESS" | "WARN" | "FAIL" | "NONE";
    requestCode: any;
    responseCode?: any;
};

const sampleEvent: IClientInvokeRequest = {
    WaitSeconds: 0,
    DoError: false,
    DoPanic: false,
};

const serializedSampleEvent = JSON.stringify(sampleEvent, null, 4);

export default function InvokePage() {
    const navigate = useNavigate();
    const recordInvocation = useStore((state) => state.recordInvocation);

    const [codeEditorValue, setCodeEditorValue] = useState(
        serializedSampleEvent
    );
    const [requestsInProgress, setRequestsInProgress] = useState(0);
    const [responses, setResponses] = useState<Array<Response>>([]);

    const mutation = useMutation<
        ILambdaResponse,
        Error,
        IClientInvokeRequest,
        { startTime: Date }
    >({
        mutationKey: ["sync-invoke"],
        mutationFn: syncInvoke,
        onMutate: () => {
            setRequestsInProgress((count) => count + 1);
            return { startTime: new Date() };
        },
        onError: (error, variables) => {
            console.log("FAILED", error);
            const elem: Response = {
                status: "FAIL",
                requestCode: variables,
                responseCode: error,
            };
            setResponses((resp) => [elem, ...resp]);
        },
        onSuccess: (data, variables) => {
            const elem: Response = {
                status: "SUCCESS",
                requestCode: variables,
                responseCode: data,
            };
            setResponses((resp) => [elem, ...resp]);
        },
        onSettled: (data, _, variables, context) => {
            setRequestsInProgress((count) => count - 1);

            if (!data || !context) {
                return;
            }

            recordInvocation(variables, data, {
                startTime: context.startTime,
                endTime: new Date(),
            });
        },
    });

    const onClick = (_: any) => {
        const invokeRequest = JSON.parse(
            codeEditorValue
        ) as IClientInvokeRequest;
        mutation.mutate(invokeRequest);
    };

    const onNotificationDismiss = (index: number) => {
        setResponses((responses) => [
            ...responses.slice(0, index),
            ...responses.slice(index + 1),
        ]);
    };

    return (
        <ContentLayout
            header={<Header variant="h1">Invoke</Header>}
            notifications={
                <NotificationSection
                    requestsInProgress={requestsInProgress}
                    responses={responses}
                    onDismiss={onNotificationDismiss}
                />
            }
        >
            <CodeEditorView
                codeEditorValue={codeEditorValue}
                setCodeEditorValue={setCodeEditorValue}
            />

            <Button variant="primary" onClick={onClick}>
                Invoke
            </Button>

            <Button variant="link" onClick={() => navigate("/")}>
                Timeline
            </Button>
        </ContentLayout>
    );
}

interface NotificationSectionProps {
    requestsInProgress: number;
    responses: Array<Response>;
    onDismiss: (index: number) => void;
}

function NotificationSection(props: NotificationSectionProps) {
    const pendingRequestsFlashbarItems: FlashbarProps.MessageDefinition[] =
        Array.from({ length: props.requestsInProgress }, (_, index) => ({
            type: "info",
            key: `pending_invoke-${index}`,
            loading: true,
            content: <b>Invoking Lambda</b>,
        }));

    const renderResponseItem = (item: Response, index: number) => {
        const onDismiss = () => props.onDismiss(index);

        if (item.status === "FAIL") {
            return (
                <div key={`response-${index}`}>
                    <Alert
                        type="error"
                        header={<h2>Error</h2>}
                        dismissible
                        onDismiss={onDismiss}
                    >
                        <p>
                            The lambda invoke service threw an error. This error
                            was not requested by the user.
                        </p>
                        <DualCodeView item={item} />
                    </Alert>
                </div>
            );
        }

        const isError = "errorType" in item.responseCode;
        const alertType: AlertProps.Type = isError ? "warning" : "success";
        const header = isError ? "Lambda Returned Error" : "Success";

        return (
            <div key={`response-${index}`}>
                <Alert
                    type={alertType}
                    header={<h2>{header}</h2>}
                    dismissible
                    onDismiss={onDismiss}
                >
                    {isError && (
                        <p>
                            The lambda returned an error. On panics the instance
                            is killed
                        </p>
                    )}
                    <DualCodeView item={item} />
                </Alert>
            </div>
        );
    };

    return (
        <>
            <Flashbar items={pendingRequestsFlashbarItems} />
            {props.responses.map(renderResponseItem)}
        </>
    );
}

function DualCodeView({ item }: { item: Response }) {
    const formattedRequestCode = JSON.stringify(item.requestCode, null, 4);
    const formattedResponseCode = JSON.stringify(item.responseCode, null, 4);

    return (
        <table>
            <thead>
                <tr>
                    <th>Request</th>
                    <th>Response</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <CodeView
                            lineNumbers
                            content={formattedRequestCode}
                            highlight={jsonHighlight}
                        />
                    </td>
                    <td>
                        <CodeView
                            lineNumbers
                            content={formattedResponseCode}
                            highlight={jsonHighlight}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
