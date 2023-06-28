package config

import (
	"encoding/json"
	"os"
)

type Configuration struct {
	Port     string `json:"port"`
	APIToken string `json:"api_token"`
	LogLevel string `json:"log_level"`

	SendgridAPIKey string `json:"sendgrid_api_key"`
	SenderEmail    string `json:"sender_email"`
	RecipientEmail string `json:"recipient_email"`
}

func (config *Configuration) Load(configFile string) error {
	f, err := os.Open(configFile)
	if err != nil {
		return err
	}
	d := json.NewDecoder(f)
	err = d.Decode(config)
	return err
}
