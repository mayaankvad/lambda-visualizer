# Lambda Visualizer

A visualizer for AWS Lambda's internal behavior. It visualizes the cold start and concurrent scaling process by emulating the Lambda Runtime API with isolated Go processes. This helps developers understand why functions behave as they do and how to optimize for performance.

[Full Writeup: https://mayaankvad.github.io/lambda-visualizer](https://mayaankvad.github.io/lambda-visualizer)

## Running Locally

```
docker pull ghcr.io/mayaankvad/lambda-visualizer:latest

docker run -p 8000:8000 -it ghcr.io/mayaankvad/lambda-visualizer:latest
```

## Development

This project is configured with a [devcontainer](https://containers.dev), which provides a complete and consistent development environment. Using a devcontainer ensures that you have all the necessary tools and dependencies pre-installed and ready to go, without needing to set them up on your local machine. This guarantees a smooth and predictable setup for all contributors.

Install the [devcontainers](https://code.visualstudio.com/docs/devcontainers/containers) extension for vscode.

To get started, simply open the project in VS Code and you'll be prompted to "Reopen in Container". Alternatively, you can use the VS Code command palette (Cmd+Shift+P on Mac or Ctrl+Shift+P on Windows) and select "Dev Containers: Open Folder in Container..."

This devcontainer includes all the required tools and dependencies, (Node.js, pnpm, Docker, AWS CDK), allowing you to begin development immediately without any manual configuration in a reproducible environment

## Tenets

### Use the AWS Go SDK Out of the Box

This project strictly uses the AWS-provided Go Lambda runtime, mirroring the experience of all other customers. By not modifying the SDK or directly interacting with the Lambda service, the demo accurately illustrates the same APIs and behaviors that the service exposes to its users. This approach ensures the demonstration is an authentic representation of the Lambda environment.

### A Demo, Not a Full-Featured Lambda Service

This project is a demonstration of Lambda's core mechanics and is not a production-ready, one-to-one replica of the AWS Lambda service. Key features of the full service, such as IAM authentication, streaming, or asynchronous invocation, are not supported. For simplicity and clarity, the demo is limited to a small, hardcoded output after a specified delay, which is sufficient to illustrate its core purpose without the complexity of a full implementation.

### Scalability and Concurrency for Demonstration

The demo is designed to be runnable by a small team simultaneously when hosted. While it is not intended for large-scale production use, it handles basic race conditions to ensure a stable, multi-user experience. It's important to note, however, that the project is not foolproof; for example, terminating an instance during an active request may cause the request to hang. This design choice prioritizes a clear demonstration of core concepts over production-level reliability.
