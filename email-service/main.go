package main

import (
	"flag"

	"github.com/bitmark-inc/exitwithstatus"
	_ "github.com/lib/pq"

	"github.com/NarrowPacific/email-service/config"
	"github.com/NarrowPacific/email-service/logger"
	"github.com/NarrowPacific/email-service/web"
)

func main() {
	var GitCommit string
	var configFile string
	var config config.Configuration

	// Parse cli flags
	flag.StringVar(&configFile, "conf", "./service.conf", "service configuration")
	flag.Parse()

	// Load config from file
	err := config.Load(configFile)
	if err != nil {
		exitwithstatus.Message("Cannot open config file: %s", err.Error())
	}

	// Init Logger
	log, err := logger.NewLogger(config)
	if err != nil {
		exitwithstatus.Message("Cannot initialize logger: %s", err.Error())
	}

	webServer := web.New(GitCommit, config.APIToken, config.SendgridAPIKey, config.SenderEmail, config.RecipientEmail, log.WithField("prefix", "web"))
	webServer.Run(config.Port)
}
