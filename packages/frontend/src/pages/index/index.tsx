import { ContentLayout, Header } from "@cloudscape-design/components";
import { InvokeHistorySection } from "./InvokeHistoryChartView";
import { IntroductionCard } from "./intro";

export default function IndexPage() {
    return (
        <ContentLayout header={<Header variant="h1">Lambda Visualizer</Header>}>
            <IntroductionCard />
            <InvokeHistorySection />
        </ContentLayout>
    );
}
