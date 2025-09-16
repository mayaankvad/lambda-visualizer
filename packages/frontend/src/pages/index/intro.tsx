import {
    Box,
    Button,
    Container,
    Header,
    SpaceBetween,
    TextContent,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import { ARTICLE_LINK } from "../../config";

export function IntroductionCard() {
    const navigate = useNavigate();
    const onClick = () => navigate("/invoke");

    return (
        <Container
            header={
                <Header variant="h2">
                    Understanding Lambda cold starts and concurrency patterns
                </Header>
            }
        >
            <SpaceBetween direction="vertical" size="l">
                <TextContent>
                    <p>
                        Have you ever wondered why the first request to your
                        Lambda function takes so long? Or why it doesn't share a
                        single instance across multiple users? The answer lies
                        deep inside the <strong>Lambda Runtime</strong>. This
                        demo exposes the hidden architecture behind{" "}
                        <strong>cold starts</strong> and{" "}
                        <strong>concurrency</strong>.
                    </p>
                </TextContent>

                <Box>
                    <SpaceBetween direction="vertical" size="m">
                        <Header variant="h3">What the Demo Shows</Header>

                        <SpaceBetween direction="vertical" size="s">
                            <TextContent>
                                <p>
                                    <strong>📊 Timeline View:</strong> A visual
                                    timeline will show the lifespan of each
                                    invocation, from cold starts to warm reuse.
                                </p>
                            </TextContent>

                            <TextContent>
                                <p>
                                    <strong>⏳ Cold Starts:</strong> See how a
                                    new instance is created for each new
                                    concurrent request, incurring a startup
                                    delay.
                                </p>
                            </TextContent>

                            <TextContent>
                                <p>
                                    <strong>🚀 Concurrency:</strong> Watch how
                                    Lambda scales horizontally by spinning up
                                    new instances instead of sharing a single
                                    one.
                                </p>
                            </TextContent>

                            <TextContent>
                                <p>
                                    <strong>🔥 Warm Invocation:</strong> Observe
                                    how subsequent requests to a "warm" instance
                                    are processed almost instantly.
                                </p>
                            </TextContent>
                        </SpaceBetween>
                    </SpaceBetween>
                </Box>

                <Box>
                    <SpaceBetween direction="vertical" size="m">
                        <TextContent>
                            <p>
                                <strong>Ready to see how it works?</strong>
                            </p>
                        </TextContent>

                        <SpaceBetween direction="horizontal" size="m">
                            <Button variant="primary" onClick={onClick}>
                                Invoke Lambda
                            </Button>

                            <Button variant="link" href={ARTICLE_LINK}>
                                Learn More
                            </Button>
                        </SpaceBetween>
                    </SpaceBetween>
                </Box>
            </SpaceBetween>
        </Container>
    );
}
