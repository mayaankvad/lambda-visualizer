import { Stack, type StackProps } from "aws-cdk-lib";
import { LogQueryWidget } from "aws-cdk-lib/aws-cloudwatch";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { FullWidth, MonitoringFacade } from "cdk-monitoring-constructs";
import { Construct } from "constructs";

export interface MonitoringStackProps extends StackProps {
    readonly fargateService: ApplicationLoadBalancedFargateService;
    readonly logGroup: LogGroup;
}

export class MonitoringStack extends Stack {
    constructor(scope: Construct, name: string, props: MonitoringStackProps) {
        super(scope, name, props);

        const monitoring = new MonitoringFacade(
            this,
            "LambdaVisualizerMonitoring",
            {}
        );

        const { fargateService, logGroup } = props;

        monitoring.monitorFargateApplicationLoadBalancer({
            fargateService: fargateService.service,
            applicationLoadBalancer: fargateService.loadBalancer,
            applicationTargetGroup: fargateService.targetGroup,
        });

        const logQuery = new LogQueryWidget({
            title: "Fargate Service Logs",
            logGroupNames: [logGroup.logGroupName],
            width: FullWidth,
            queryLines: [
                "fields @timestamp, @message, @logStream",
                "sort @timestamp desc",
                "limit 1000",
            ],
        });

        monitoring.addWidget(logQuery);
    }
}
