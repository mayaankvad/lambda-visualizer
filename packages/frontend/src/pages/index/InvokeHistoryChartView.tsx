import { Button, SpaceBetween } from "@cloudscape-design/components";
import Chart from "react-google-charts";
import { useStore, type IInvokeRecord } from "../../store/useStore";

export function InvokeHistorySection() {
    const invocations = useStore((state) => state.invocations);
    const clear = useStore((state) => state.clear);

    return (
        <section>
            <h3>Invocation Timeline</h3>

            <SpaceBetween direction="horizontal" size="m">
                <Button onClick={clear}>Clear</Button>
                <Button
                    onClick={useStore.persist.rehydrate}
                    iconName="refresh"
                />
            </SpaceBetween>
            <div style={{ padding: "10px" }} />

            <InvokeHistoryChartView invocations={invocations} />
        </section>
    );
}

function InvokeHistoryChartView({
    invocations,
}: {
    invocations: IInvokeRecord[];
}) {
    // react-google-charts errors if rendered with no data.
    if (invocations.length == 0) {
        return <></>;
    }

    const transformedInvocations = invocations.map(transformToChartFormat);

    return (
        <>
            <SpaceBetween direction="horizontal" size="m">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    PID {"|"}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#FFBF00",
                        }}
                    ></div>
                    <span>Warm Start</span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#0000FF",
                        }}
                    ></div>
                    <span>Cold Start</span>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#FF0000",
                        }}
                    ></div>
                    <span>Killed</span>
                </div>
            </SpaceBetween>
            <div style={{ padding: "10px" }} />

            <Chart
                chartType="Timeline"
                options={{
                    backgroundColor: "#ffffff",
                    allowHtml: true,
                    height: 500,
                }}
                legendToggle
                data={[columns, ...transformedInvocations]}
            />
        </>
    );
}

const columns = [
    { type: "string", id: "Position" },
    { type: "string", id: "Name" },
    { type: "string", role: "style" },
    { type: "string", role: "tooltip" },
    { type: "date", id: "Start" },
    { type: "date", id: "End" },
];

function transformToChartFormat(raw: IInvokeRecord): Array<any> {
    const barColor = getBarColor(raw);
    const tooltip = `
        <pre>${JSON.stringify(raw, null, 4)}</pre>
    `;

    const style = `color: ${barColor}`;
    const elapsed = (raw.endTime.getTime() - raw.startTime.getTime()) / 1000;
    const name = `${raw.Count} (${elapsed}s)`;

    return [
        raw.PID.toString(),
        name,
        style,
        tooltip,
        raw.startTime,
        raw.endTime,
    ];
}

function getBarColor(invocation: IInvokeRecord): string {
    if (invocation.Count === 1) {
        return "#0000FF";
    }

    if (
        "errorType" in invocation.response &&
        invocation.response.errorType === "panicResponse"
    ) {
        return "#FF0000";
    }

    return "#FFBF00";
}
