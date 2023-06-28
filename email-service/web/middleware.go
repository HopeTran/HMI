package web

import (
	"errors"
	"github.com/gin-gonic/gin"

	appError "github.com/NarrowPacific/common-go/app-error"
)

// authenticate is an middleware to check each request identity
// only authorized marketplace is able to perform action in its marketplace
func (s *Server) authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/version" {
			return
		}

		if err := s.authenticateMarketplace(c.Request.Header.Get("api-token")); err != nil {
			c.Error(appError.NewUnauthorizedError().WithMessage("unauthorized request"))
			return
		}

		c.Next()
	}
}

// authenticateMarketplace check whether a marketplace is registered and
// with a valid api-token
func (s *Server) authenticateMarketplace(token string) error {
	if token != s.apiToken {
		return errors.New("invalid access token")
	}

	return nil
}

func (s *Server) applyErrorHandler() gin.HandlerFunc {
	return errorHandler(gin.ErrorTypeAny)
}

func errorHandler(errType gin.ErrorType) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		errors := c.Errors.ByType(errType)

		if len(errors) > 0 {
			err := errors[0].Err
			var inAppError *appError.AppError

			switch err.(type) {
			case *appError.AppError:
				inAppError = err.(*appError.AppError)
				inAppError.AddDefaultValuesIfMissing()
			default:
				inAppError = &appError.AppError{
					Message: err.Error(),
				}
				inAppError.AddDefaultValuesIfMissing()
			}

			c.AbortWithStatusJSON(inAppError.StatusCode, inAppError)
			return
		}
	}
}
