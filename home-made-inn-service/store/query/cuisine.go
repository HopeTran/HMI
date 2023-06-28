package query

import (
	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type CuisineParams struct {
	Id     int
	Ids    []string
	Offset *int
	Limit  *int
}

type CuisineQueryBuilder struct {
	tx *gorm.DB
}

func NewCuisineQueryBuilder(tx *gorm.DB) *CuisineQueryBuilder {
	return &CuisineQueryBuilder{tx: tx.Model(model.Cuisine{})}
}

func (c *CuisineQueryBuilder) Build() *gorm.DB {
	return c.tx
}

// FILTERS
func (c *CuisineQueryBuilder) ById(id int) *CuisineQueryBuilder {
	if id > 0 {
		c.tx = c.tx.Where("id = ?", id)
	}
	return c
}

func (c *CuisineQueryBuilder) ByIds(ids []string) *CuisineQueryBuilder {
	if len(ids) > 0 {
		c.tx = c.tx.Where("id IN (?)", ids)
	}
	return c
}

// PAGINATION
func (c *CuisineQueryBuilder) Offset(offset *int) *CuisineQueryBuilder {
	if offset != nil {
		c.tx = c.tx.Offset(*offset)
	}
	return c
}

func (c *CuisineQueryBuilder) Limit(limit *int) *CuisineQueryBuilder {
	if limit != nil {
		c.tx = c.tx.Limit(*limit)
	}
	return c
}
