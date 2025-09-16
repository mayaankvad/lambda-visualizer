import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { InfrastructureStack } from "./infrastructure-stack";
import { MonitoringStack } from "./monitoring-stack";

export class LambdaVisualizerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const infra = new InfrastructureStack(this, "InfrastructureStack", {});
        const monitoring = new MonitoringStack(this, "MonitoringStack", {
            fargateService: infra.fargateService,
            logGroup: infra.logGroup,
        });

        const { loadBalancerDnsName } = infra.fargateService.loadBalancer;
        new CfnOutput(this, "LoadBalancerDnsName", {
            value: loadBalancerDnsName,
        });
    }
}
