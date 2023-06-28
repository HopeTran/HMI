package query

import (
	"strings"

	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type AttributeValueParams struct {
	Id          int    `form:"id"`
	Ids         []int  `form:"ids"`
	Name        string `form:"name"`
	AttributeId int    `form:"attributeId"`
	Offset      *int   `form:"offset"`
	Limit       *int   `form:"limit"`
	CountOnly   bool   `form:"countOnly"`
}

type AttributeValueQueryBuilder struct {
	tx *gorm.DB
}

func NewAttributeValueQueryBuilder(tx *gorm.DB) *AttributeValueQueryBuilder {
	return &AttributeValueQueryBuilder{tx: tx.Model(model.AttributeValue{})}
}

func (c *AttributeValueQueryBuilder) Build() *gorm.DB {
	return c.tx
}

// FILTERS
func (c *AttributeValueQueryBuilder) ById(id int) *AttributeValueQueryBuilder {
	if id > 0 {
		c.tx = c.tx.Where("id = ?", id)
	}
	return c
}

func (c *AttributeValueQueryBuilder) ByAttributeId(attributeId int) *AttributeValueQueryBuilder {
	if attributeId > 0 {
		c.tx = c.tx.Where("attribute_id = ?", attributeId)
	}
	return c
}

func (c *AttributeValueQueryBuilder) ByIds(ids []int) *AttributeValueQueryBuilder {
	if len(ids) > 0 {
		c.tx = c.tx.Where("id IN (?)", ids)
	}
	return c
}

func (c *AttributeValueQueryBuilder) ByName(name string) *AttributeValueQueryBuilder {
	if len(name) > 0 {
		c.tx = c.tx.Where("lower(name) like ?", "%"+strings.ToLower(name)+"%")
	}
	return c
}

// PAGINATION
func (c *AttributeValueQueryBuilder) Offset(offset *int) *AttributeValueQueryBuilder {
	if offset != nil {
		c.tx = c.tx.Offset(*offset)
	}
	return c
}

func (c *AttributeValueQueryBuilder) Limit(limit *int) *AttributeValueQueryBuilder {
	if limit != nil {
		c.tx = c.tx.Limit(*limit)
	}
	return c
}
