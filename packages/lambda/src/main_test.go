package main

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/aws/aws-lambda-go/lambdacontext"
	"github.com/stretchr/testify/assert"
)

const mockedUUID = "00000000-0000-0000-0000-000000000000"

var mockedLambdaContext = lambdacontext.NewContext(context.Background(), &lambdacontext.LambdaContext{
	AwsRequestID: mockedUUID,
})

func Test_HandleRequest_Single(t *testing.T) {
	invokeCount = 0

	start := time.Now()
	actual, err := handleRequest(mockedLambdaContext, Event{WaitSeconds: 2})
	elapsed := time.Since(start)

	assert.NoError(t, err)
	assert.Equal(t, invokeCount, 1)
	assert.GreaterOrEqual(t, elapsed.Seconds(), float64(2))

	expected := Response{
		PID:          os.Getpid(),
		Count:        1,
		AwsRequestID: mockedUUID,
	}

	assert.Equal(t, expected, actual)
}

func Test_HandleRequest_Multiple(t *testing.T) {
	invokeCount = 0

	for i := range 3 {
		start := time.Now()
		actual, err := handleRequest(mockedLambdaContext, Event{WaitSeconds: i})
		elapsed := time.Since(start)

		assert.NoError(t, err)
		assert.Equal(t, invokeCount, i+1)
		assert.GreaterOrEqual(t, elapsed.Seconds(), float64(i))

		expected := Response{
			PID:          os.Getpid(),
			Count:        i + 1,
			AwsRequestID: mockedUUID,
		}

		assert.Equal(t, expected, actual)
	}
}

func Test_HandleRequest_Error(t *testing.T) {
	invokeCount = 0

	expected := errorResponse{
		Response: Response{
			PID:          os.Getpid(),
			Count:        1,
			AwsRequestID: mockedUUID,
		},
	}

	_, err := handleRequest(mockedLambdaContext, Event{DoError: true})
	assert.ErrorAs(t, err, &expected)
}

func Test_HandleRequest_Panic(t *testing.T) {
	invokeCount = 0

	expected := panicResponse{
		Response: Response{
			PID:          os.Getpid(),
			Count:        1,
			AwsRequestID: mockedUUID,
		},
	}

	assert.PanicsWithError(t, expected.Error(), func() {
		_, _ = handleRequest(mockedLambdaContext, Event{DoPanic: true})
	})
}
