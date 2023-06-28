package model

type Profit struct {
	Year      int     `json:"year"`
	Month     int     `json:"month"`
	Week      int     `json:"week"`
	WeekDay   string  `json:"weekDay"`
	CreatedAt string  `json:"createdAt"`
	OrderId   string  `json:"orderId"`
	ProductId int     `json:"productId"`
	Profit    float64 `json:"profit"`
}

type ProfitSummary struct {
	ThisWeek []Profit `json:"thisWeek"`
	LastWeek []Profit `json:"lastWeek"`
}
