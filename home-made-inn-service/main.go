package main

import (
	"flag"

	"github.com/bitmark-inc/exitwithstatus"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
	prefixed "github.com/x-cray/logrus-prefixed-formatter"

	"home-made-inn-service/model"
	dbStore "home-made-inn-service/store/db"
	"home-made-inn-service/web"
)

var GitCommit string

func main() {
	var configFile string
	var config model.Configuration

	flag.StringVar(&configFile, "conf", "./home-made-inn.conf", "configuration file")
	flag.Parse()

	err := config.Load(configFile)
	if err != nil {
		exitwithstatus.Message("can not open config file: %s", err.Error())
	}

	log := logrus.New()
	log.Formatter = &prefixed.TextFormatter{
		FullTimestamp: true,
	}
	log.Level = logrus.DebugLevel

	// DBs
	dbStore := dbStore.NewDBStore(config.DBURL, config.DBURL)

	webServer := web.NewServer(config.APIToken, GitCommit, dbStore, log.WithField("backend", "service"))

	webServer.StartCronJobs()

	webServer.Run(config.Port)
}
