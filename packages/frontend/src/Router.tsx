import {
    AppLayout,
    type AppLayoutProps,
    type NonCancelableCustomEvent,
} from "@cloudscape-design/components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SideNav, TopNav } from "./componants/navigation";
import IndexPage from "./pages/index";
import RunningInstancesPage from "./pages/instances";
import InvokePage from "./pages/invoke";

const queryClient = new QueryClient();

export default function Router() {
    const [navigationOpen, setNavigationOpen] = useState(true);

    const onNavigationChange = (
        event: NonCancelableCustomEvent<AppLayoutProps.ChangeDetail>
    ) => {
        setNavigationOpen(event.detail.open);
    };

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <TopNav />
                <AppLayout
                    navigationOpen={navigationOpen}
                    onNavigationChange={onNavigationChange}
                    navigation={<SideNav />}
                    toolsHide
                    content={
                        <Routes>
                            <Route path="/" element={<IndexPage />} />
                            <Route path="/invoke" element={<InvokePage />} />
                            <Route
                                path="/instances"
                                element={<RunningInstancesPage />}
                            />
                        </Routes>
                    }
                />
            </BrowserRouter>

            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
