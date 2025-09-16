import {
    Box,
    ContentLayout,
    Flashbar,
    FlashbarProps,
    Header,
    SpaceBetween,
    TextContent,
} from "@cloudscape-design/components";
import Button from "@cloudscape-design/components/button";
import Cards from "@cloudscape-design/components/cards";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRunningInstances, killInstance } from "../../network";

export default function RunningInstancesPage() {
    const [notificationItems, setNotiticationItems] = useState<
        Array<FlashbarProps.MessageDefinition>
    >([]);

    const notify = (
        messageType: FlashbarProps.Type,
        header: string,
        content?: string
    ) => {
        const id = Math.random().toString();

        const message: FlashbarProps.MessageDefinition = {
            id,
            type: messageType,
            header,
            content,
            dismissible: true,
            onDismiss: () => {
                setNotiticationItems((notifications) =>
                    notifications.filter((i) => i.id != id.toString())
                );
            },
        };

        setNotiticationItems((notifications) => [message, ...notifications]);
    };

    const {
        data: runningInstances,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ["getRunningInstances"],
        queryFn: getRunningInstances,
        refetchInterval: 10 * 1000,
        refetchOnMount: true,
    });

    const { mutate: kill } = useMutation<void, Error, number>({
        mutationKey: ["kill-instance"],
        mutationFn: killInstance,
        onSuccess: (_, pid) => {
            notify("success", `Sucessfully stopped instance pid: ${pid}`);
            refetch();
        },
        onError: (error, pid) => {
            notify(
                "error",
                `Failed to stop instance pid: ${pid}`,
                error.message
            );
        },
    });

    return (
        <ContentLayout
            header={<Header variant="h1">Running Instances</Header>}
            notifications={<Flashbar stackItems items={notificationItems} />}
        >
            <Cards
                cardDefinition={{
                    header: (pid: number) => (
                        <Header
                            variant="h3"
                            actions={
                                <Button onClick={() => kill(pid)}>Kill</Button>
                            }
                        >
                            Instance ID: {pid}
                        </Header>
                    ),
                }}
                loading={isFetching}
                loadingText="Loading Running Instances"
                items={runningInstances!}
                cardsPerRow={[{ cards: 3 }, { minWidth: 500, cards: 3 }]}
                empty={<NoRunningInstancesView />}
                header={
                    <Header
                        actions={
                            <Button
                                onClick={() => refetch()}
                                iconName="refresh"
                            />
                        }
                    >
                        <TextContent>
                            <p>Instances</p>
                        </TextContent>
                    </Header>
                }
            />
        </ContentLayout>
    );
}

function NoRunningInstancesView() {
    const navigate = useNavigate();
    const onClick = () => navigate("/invoke");

    return (
        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
            <SpaceBetween size="m">
                <b>No Instances</b>
                <p>Lambda automatically starts instances as needed to scale.</p>
                <Button variant="link" onClick={onClick}>
                    Invoke
                </Button>
            </SpaceBetween>
        </Box>
    );
}
