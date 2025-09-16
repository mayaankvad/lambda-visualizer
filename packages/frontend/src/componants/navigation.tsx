import SideNavigation, {
    type SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useNavigate } from "react-router-dom";
import { ARTICLE_LINK, REPO_LINK } from "../config";

export function SideNav() {
    const navigate = useNavigate();

    const handleFollow = (
        event: CustomEvent<SideNavigationProps.FollowDetail>
    ) => {
        event.preventDefault();
        const isExternal = event.detail.external;
        if (isExternal) {
            window.open(event.detail.href, '_blank');
        } else {
            navigate(event.detail.href);
        }
    };

    return (
        <SideNavigation
            onFollow={handleFollow}
            header={{ href: "/", text: "Lambda Visualizer" }}
            items={[
                { type: "link", text: `Home`, href: `/` },
                { type: "link", text: `Invoke`, href: `/invoke` },
                { type: "link", text: `Instances`, href: `/instances` },
                { type: "divider" },
                {
                    type: "link",
                    text: "Article",
                    href: ARTICLE_LINK,
                    external: true,
                },
                {
                    type: "link",
                    text: "Github",
                    href: REPO_LINK,
                    external: true,
                },
            ]}
        />
    );
}

export function TopNav() {
    return (
        <TopNavigation
            identity={{
                href: "#",
                title: "Lambda Visualizer",
                logo: {
                    src: "/lambda-icon.png",
                },
            }}
            utilities={[
                {
                    type: "button",
                    text: "Article",
                    href: ARTICLE_LINK,
                    external: true,
                },
                {
                    type: "button",
                    text: "Github",
                    href: REPO_LINK,
                    external: true,
                },
            ]}
        />
    );
}
