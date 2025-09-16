import { Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { DockerImageAsset, Platform } from "aws-cdk-lib/aws-ecr-assets";
import { ContainerImage, LogDrivers } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import path from "path";

export class InfrastructureStack extends Stack {
    public readonly fargateService: ApplicationLoadBalancedFargateService;
    public readonly logGroup: LogGroup;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const projectRootPath = path.join(__dirname, "..", "..", "..");

        const dockerImage = new DockerImageAsset(
            this,
            "LambdaVisualizerContainerImage",
            {
                directory: projectRootPath,
                platform: Platform.LINUX_AMD64,
                file: "Dockerfile",
                exclude: [
                    // Dockerfile copies the entire workspace including this cdk package.
                    // Causes a recursive cdk.out asset name. Ignore this package explicitly.
                    "packages/cdk",
                    "cdk.out",
                    "node_modules",
                ],
            }
        );

        this.logGroup = new LogGroup(this, "LambdaVisualizerLogGroup", {
            retention: RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const logDriver = LogDrivers.awsLogs({
            streamPrefix: "lambda-visualizer",
            logGroup: this.logGroup,
        });

        this.fargateService = new ApplicationLoadBalancedFargateService(
            this,
            "LambdaVisualizerFargateService",
            {
                cpu: 1024,
                memoryLimitMiB: 4096,
                minHealthyPercent: 100,
                taskImageOptions: {
                    image: ContainerImage.fromDockerImageAsset(dockerImage),
                    containerPort: 8000,
                    logDriver,
                    environment: {
                        FORCE_COLOR: "0",
                        CLOUD: "true",
                    },
                },
            }
        );

        this.fargateService.targetGroup.enableCookieStickiness(
            Duration.hours(1)
        );
        this.fargateService.targetGroup.configureHealthCheck({
            path: "/health-check",
        });

        const scalableTarget = this.fargateService.service.autoScaleTaskCount({
            minCapacity: 1,
            maxCapacity: 3,
        });

        scalableTarget.scaleOnCpuUtilization("CpuScaling", {
            targetUtilizationPercent: 95,
            scaleInCooldown: Duration.seconds(120),
            scaleOutCooldown: Duration.seconds(120),
        });
    }
}
