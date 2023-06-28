package query

import (
	"strings"

	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type ProductParams struct {
	Id      int
	Ids     []int
	StoreId int
	Name    string
	Offset  *int
	Limit   *int

	Preloads []string
}

type ProductQueryBuilder struct {
	tx *gorm.DB
}

func NewProductQueryBuilder(tx *gorm.DB) *ProductQueryBuilder {
	return &ProductQueryBuilder{tx: tx.Model(model.Product{})}
}

func (s *ProductQueryBuilder) Build() *gorm.DB {
	return s.tx
}

// FILTERS
func (s *ProductQueryBuilder) ById(id int) *ProductQueryBuilder {
	s.tx = s.tx.Where("id = ?", id)
	return s
}

func (s *ProductQueryBuilder) ByIds(ids []int) *ProductQueryBuilder {
	if len(ids) > 0 {
		s.tx = s.tx.Where("id IN (?)", ids)
	}
	return s
}

func (s *ProductQueryBuilder) ByStoreId(storeId int) *ProductQueryBuilder {
	if storeId > 0 {
		s.tx = s.tx.Where("store_id = ?", storeId)
	}
	return s
}

func (s *ProductQueryBuilder) ByName(name string) *ProductQueryBuilder {
	if len(name) > 0 {
		s.tx = s.tx.Where("lower(name) like ?", "%"+strings.ToLower(name)+"%")
	}
	return s
}

// PRELOAD
func (s *ProductQueryBuilder) Preloads(preloads []string) *ProductQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			s.tx = s.tx.Preload(preload)
		}
	}
	return s
}

// PAGINATION
func (s *ProductQueryBuilder) Offset(offset *int) *ProductQueryBuilder {
	if offset != nil {
		s.tx = s.tx.Offset(*offset)
	}
	return s
}

func (s *ProductQueryBuilder) Limit(limit *int) *ProductQueryBuilder {
	if limit != nil {
		s.tx = s.tx.Limit(*limit)
	}
	return s
}
