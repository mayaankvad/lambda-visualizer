package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/lambdacontext"
)

type Event struct {
	WaitSeconds int
	DoError     bool
	DoPanic     bool
}

type Response struct {
	PID          int
	Count        int
	AwsRequestID string
}

// Seperate structs for error and panic to differentiate "errorType"

type errorResponse struct {
	Response
}

func (e errorResponse) Error() string {
	bytes, _ := json.Marshal(e)
	return string(bytes)
}

type panicResponse struct {
	Response
}

func (e panicResponse) Error() string {
	bytes, _ := json.Marshal(e)
	return string(bytes)
}

var invokeCount = 0

func init() {
	time.Sleep(3000) // Simulate a cold start
}

func handleRequest(ctx context.Context, event Event) (Response, error) {
	invokeCount++
	pid := os.Getpid()

	lc, ok := lambdacontext.FromContext(ctx)
	if !ok {
		panic(fmt.Errorf("failed to get Lambda context"))
	}

	slog.Info(fmt.Sprintf("PID %d received event. AwsRequestID: %s", pid, lc.AwsRequestID))
	response := Response{pid, invokeCount, lc.AwsRequestID}

	// Simulate "work"
	time.Sleep(time.Second * time.Duration(event.WaitSeconds))

	if event.DoPanic {
		panic(panicResponse{response})
	}

	if event.DoError {
		return response, errorResponse{response}
	}

	return response, nil
}

func main() {
	lambda.Start(handleRequest)
}
