package model

type SampleCronJob struct {
	ExchangeId    string `json:"exchangeId"`
	BaseCurrency  string `json:"baseCurrency"`
	QuoteCurrency string `json:"quoteCurrency"`
	Symbol        string `json:"symbol"`
}
