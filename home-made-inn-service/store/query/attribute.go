package query

import (
	"strings"

	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type AttributeParams struct {
	Id        int    `form:"id"`
	Ids       []int  `form:"ids"`
	Name      string `form:"name"`
	Label     string `form:"label"`
	Offset    *int   `form:"offset"`
	Limit     *int   `form:"limit"`
	CountOnly bool   `form:"countOnly"`

	Preloads []string
}

type AttributeQueryBuilder struct {
	tx *gorm.DB
}

func NewAttributeQueryBuilder(tx *gorm.DB) *AttributeQueryBuilder {
	return &AttributeQueryBuilder{tx: tx.Model(model.Attribute{})}
}

func (c *AttributeQueryBuilder) Build() *gorm.DB {
	return c.tx
}

// FILTERS
func (c *AttributeQueryBuilder) ById(id int) *AttributeQueryBuilder {
	if id > 0 {
		c.tx = c.tx.Where("id = ?", id)
	}
	return c
}

func (c *AttributeQueryBuilder) ByIds(ids []int) *AttributeQueryBuilder {
	if len(ids) > 0 {
		c.tx = c.tx.Where("id IN (?)", ids)
	}
	return c
}

func (c *AttributeQueryBuilder) ByName(name string) *AttributeQueryBuilder {
	if len(name) > 0 {
		c.tx = c.tx.Where("lower(name) like ?", "%"+strings.ToLower(name)+"%")
	}
	return c
}

// PRELOAD
func (s *AttributeQueryBuilder) Preloads(preloads []string) *AttributeQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			s.tx = s.tx.Preload(preload)
		}
	}
	return s
}

// PAGINATION
func (c *AttributeQueryBuilder) Offset(offset *int) *AttributeQueryBuilder {
	if offset != nil {
		c.tx = c.tx.Offset(*offset)
	}
	return c
}

func (c *AttributeQueryBuilder) Limit(limit *int) *AttributeQueryBuilder {
	if limit != nil {
		c.tx = c.tx.Limit(*limit)
	}
	return c
}
