package query

import (
	"fmt"

	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type OrderParams struct {
	Id               string   `form:"id"`
	UserId           string   `form:"userId"`
	Status           []string `form:"status"`
	StoreId          int      `form:"storeId"`
	Ordering         string   `form:"ordering"`
	Preloads         []string `form:"preloads"`
	QueryByStoreOnly bool     `form:"queryByStoreOnly"`
}

type OrderQueryBuilder struct {
	tx *gorm.DB
}

func NewOrderQueryBuilder(tx *gorm.DB) *OrderQueryBuilder {
	return &OrderQueryBuilder{tx: tx.Model(model.Order{})}
}

func (s *OrderQueryBuilder) Build() *gorm.DB {
	return s.tx
}

// FILTERS
func (s *OrderQueryBuilder) ByOrderId(id string) *OrderQueryBuilder {
	if len(id) > 0 {
		s.tx = s.tx.Where("id IN (?)", id)
	}
	return s
}

func (s *OrderQueryBuilder) ByStoreId(storeId int) *OrderQueryBuilder {
	if storeId > 0 {
		s.tx = s.tx.Where("store_id = ?", storeId)
	}
	return s
}

func (s *OrderQueryBuilder) ByUserId(userId string) *OrderQueryBuilder {
	if len(userId) > 0 {
		s.tx = s.tx.Where("user_id = ?", userId)
	}
	return s
}

func (s *OrderQueryBuilder) ByStatus(status []string) *OrderQueryBuilder {
	if len(status) > 0 {
		s.tx = s.tx.Where("status IN (?)", status)
	}
	return s
}

func (s *OrderQueryBuilder) OrderBy(column string, ordering string) *OrderQueryBuilder {
	if len(ordering) == 0 {
		ordering = "desc"
	}
	if len(column) == 0 {
		column = "updated_at"
	}
	q := fmt.Sprintf("%s %s", column, ordering)
	s.tx = s.tx.Order(q)
	return s
}

// PRELOAD
func (s *OrderQueryBuilder) Preloads(preloads []string) *OrderQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			s.tx = s.tx.Preload(preload)
		}
	}
	return s
}
