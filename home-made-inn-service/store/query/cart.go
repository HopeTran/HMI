package query

import (
	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type CartParams struct {
	UserId    string
	ProductId int
	Quantity  int

	Preloads []string
}

type CartQueryBuilder struct {
	tx *gorm.DB
}

func NewCartQueryBuilder(tx *gorm.DB) *CartQueryBuilder {
	return &CartQueryBuilder{tx: tx.Model(model.CartItem{})}
}

func (s *CartQueryBuilder) Build() *gorm.DB {
	return s.tx
}

// FILTERS
func (s *CartQueryBuilder) ByProductId(productId int) *CartQueryBuilder {
	if productId > 0 {
		s.tx = s.tx.Where("product_id IN (?)", productId)
	}
	return s
}

func (s *CartQueryBuilder) ByUserId(userId string) *CartQueryBuilder {
	if len(userId) > 0 {
		s.tx = s.tx.Where("user_id = ?", userId)
	}
	return s
}

// PRELOAD
func (s *CartQueryBuilder) Preloads(preloads []string) *CartQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			s.tx = s.tx.Preload(preload)
		}
	}
	return s
}

// QUANTITY
func (s *CartQueryBuilder) Quantity(quantity int) *CartQueryBuilder {
	if quantity > 0 {
		s.tx = s.tx.Where(quantity)
	}
	return s
}
