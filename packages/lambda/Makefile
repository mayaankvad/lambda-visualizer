PROJECT_NAME := lambda_visualizer
GOFILES := $(shell find . -type f -name '*.go' ! -name '*_test.go')

.PHONY: all build test lint clean

all: test lint build

dev:
	AWS_LAMBDA_RUNTIME_API=127.0.0.1:8000 go run ./src/main.go

build: $(GOFILES)
	go build -o bootstrap $(GOFILES)

test:
	go test ./...

lint:
	go mod tidy
	golangci-lint run
