package web

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type Email struct {
	FromEmail string `json:"from_email"`
	ToEmail   string `json:"to_email"`
	Subject   string `json:"subject"`
	Content   string `json:"content"`
}

func (s *Server) sendEmail(c *gin.Context) {
	var payload Email

	if err := c.BindJSON(&payload); err != nil {
		s.log.WithError(err).Error("error")
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("invalid arguments"), "error": err.Error()})
		return
	}

	from := mail.NewEmail("Home Made Inn", s.senderEmail)
	to := mail.NewEmail("", payload.ToEmail)
	subject := payload.Subject

	email := mail.NewSingleEmail(from, subject, to, "", payload.Content)

	if len(payload.FromEmail) > 0 {
		email.SetReplyTo(mail.NewEmail("", payload.FromEmail))
	}

	client := sendgrid.NewSendClient(s.sendgridAPIKey)

	response, err := client.Send(email)
	if err != nil {
		s.log.WithError(err).Error("error")
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
	} else {
		if response.StatusCode == 202 {
			c.JSON(http.StatusOK, response)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": response})
		}
	}
}
