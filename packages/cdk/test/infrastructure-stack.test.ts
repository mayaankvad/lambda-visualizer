import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { InfrastructureStack } from "../stacks/infrastructure-stack";

describe("InfrastructureStack", () => {
    it("creates a Fargate service with expected properties", () => {
        const app = new App();
        const stack = new InfrastructureStack(app, "TestStack");
        const template = Template.fromStack(stack);

        template.hasResource("AWS::Logs::LogGroup", {});
        template.hasResource("AWS::ECS::Service", {});
        template.hasResource("AWS::ECS::TaskDefinition", {});
        template.hasResource("AWS::ElasticLoadBalancingV2::LoadBalancer", {});
        template.hasResource("AWS::ElasticLoadBalancingV2::TargetGroup", {});
        template.hasResource("AWS::ApplicationAutoScaling::ScalingPolicy", {});
    });
});
