package web

import (
	"errors"

	appError "github.com/NarrowPacific/common-go/app-error"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// authenticate is an middleware to check each request identity
// only authorized marketplace is able to perform action in its marketplace
func (s *Server) authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/version" {
			return
		}

		if err := s.authenticateMarketplace(c.Request.Header.Get("api-token")); err != nil {
			c.AbortWithStatusJSON(401, gin.H{"message": "unauthorized request", "error": err.Error()})
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

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func (s *Server) applyErrorHandler() gin.HandlerFunc {
	return errorHandler(gin.ErrorTypeAny, s.log)
}

func errorHandler(errType gin.ErrorType, log *logrus.Entry) gin.HandlerFunc {
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

			log.WithError(err).Error("error")

			c.AbortWithStatusJSON(inAppError.StatusCode, inAppError)
			return
		}
	}
}
