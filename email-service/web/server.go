package web

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Server struct {
	version  string
	apiToken string

	sendgridAPIKey string
	senderEmail    string
	recipientEmail string

	router *gin.Engine
	log    *logrus.Entry
}

func (s *Server) Run(addr string) error {
	r := s.router

	r.Use(s.applyErrorHandler())
	r.Use(CORS())
	r.Use(s.authenticate())

	r.GET("/version", func(c *gin.Context) {
		c.JSON(200, map[string]interface{}{
			"commit": s.version,
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, s.CheckHealth())
	})

	r.POST("/email", s.sendEmail)

	return s.router.Run(addr)
}

func New(version, apiToken string, sendgridAPIKey string, senderEmail string, recipientEmail string, log *logrus.Entry) *Server {
	r := gin.New()

	return &Server{
		version:  version,
		apiToken: apiToken,

		sendgridAPIKey: sendgridAPIKey,
		senderEmail:    senderEmail,
		recipientEmail: recipientEmail,

		router: r,
		log:    log,
	}
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
