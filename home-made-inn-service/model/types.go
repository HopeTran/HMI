package model

import "time"

type ExchangeConfig struct {
	ExchangeId    string
	IntervalLimit time.Duration
}
