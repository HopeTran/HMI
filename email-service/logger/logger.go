package logger

import (
	"github.com/sirupsen/logrus"
	prefixed "github.com/x-cray/logrus-prefixed-formatter"

	"github.com/NarrowPacific/email-service/config"
)

func NewLogger(config config.Configuration) (*logrus.Logger, error) {
	log := logrus.New()
	log.Formatter = &prefixed.TextFormatter{
		FullTimestamp: true,
	}
	logLevel, err := logrus.ParseLevel(config.LogLevel)
	log.Level = logLevel

	return log, err
}
