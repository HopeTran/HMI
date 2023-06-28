package model

import (
	"encoding/json"
	"os"
)

type Configuration struct {
	Port     string `json:"port"`
	APIToken string `json:"api_token"`
	DBURL    string `json:"db_url"`
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
