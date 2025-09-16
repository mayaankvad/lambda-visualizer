#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { LambdaVisualizerStack } from "../stacks/lambda-visualizer-stack";

const app = new App();

new LambdaVisualizerStack(app, "LambdaVisualizer", {});
