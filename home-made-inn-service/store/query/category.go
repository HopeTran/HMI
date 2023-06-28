package query

import (
	"strings"

	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type CategoryParams struct {
	Id       int
	Ids      []int
	StoreId  int
	Name     string
	Preloads []string
	Offset   *int
	Limit    *int
}

type CategoryQueryBuilder struct {
	tx *gorm.DB
}

func NewCategoryQueryBuilder(tx *gorm.DB) *CategoryQueryBuilder {
	return &CategoryQueryBuilder{tx: tx.Model(model.Category{})}
}

func (c *CategoryQueryBuilder) Build() *gorm.DB {
	return c.tx
}

// FILTERS
func (c *CategoryQueryBuilder) ById(id int) *CategoryQueryBuilder {
	if id > 0 {
		c.tx = c.tx.Where("id = ?", id)
	}
	return c
}

func (c *CategoryQueryBuilder) ByIds(ids []int) *CategoryQueryBuilder {
	if len(ids) > 0 {
		c.tx = c.tx.Where("id IN (?)", ids)
	}
	return c
}

func (c *CategoryQueryBuilder) ByStoreId(storeId int) *CategoryQueryBuilder {
	if storeId > 0 {
		c.tx = c.tx.Where("store_id = ?", storeId)
	}
	return c
}

func (c *CategoryQueryBuilder) ByName(name string) *CategoryQueryBuilder {
	if len(name) > 0 {
		c.tx = c.tx.Where("lower(name) like ?", "%"+strings.ToLower(name)+"%")
	}
	return c
}

// PRELOAD
func (c *CategoryQueryBuilder) Preloads(preloads []string) *CategoryQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			c.tx = c.tx.Preload(preload)
		}
	}
	return c
}

// PAGINATION
func (c *CategoryQueryBuilder) Offset(offset *int) *CategoryQueryBuilder {
	if offset != nil {
		c.tx = c.tx.Offset(*offset)
	}
	return c
}

func (c *CategoryQueryBuilder) Limit(limit *int) *CategoryQueryBuilder {
	if limit != nil {
		c.tx = c.tx.Limit(*limit)
	}
	return c
}
