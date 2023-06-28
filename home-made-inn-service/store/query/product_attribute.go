package query

import (
	"strings"

	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type ProductAttributeParams struct {
	Id               int     `form:"id"`
	Ids              []int   `form:"ids"`
	StoreId          int     `form:"storeId"`
	AttributeId      int     `form:"attributeId"`
	AttributeValueId int     `form:"attributeValueId" `
	ProductId        int     `form:"productId"`
	Description      string  `form:"description"`
	Price            float64 `form:"price"`
	Photo            string  `form:"photo"`
	Inventory        int     `form:"inventory"`
	InventoryLeft    int     `form:"inventoryLeft"`
	Offset           *int    `form:"offset"`
	Limit            *int    `form:"limit"`
	CountOnly        bool    `form:"countOnly"`

	Preloads []string
}

type ProductAttributeQueryBuilder struct {
	tx *gorm.DB
}

func NewProductAttributeQueryBuilder(tx *gorm.DB) *ProductAttributeQueryBuilder {
	return &ProductAttributeQueryBuilder{tx: tx.Model(model.ProductAttribute{})}
}

func (c *ProductAttributeQueryBuilder) Build() *gorm.DB {
	return c.tx
}

// FILTERS
func (c *ProductAttributeQueryBuilder) ById(id int) *ProductAttributeQueryBuilder {
	if id > 0 {
		c.tx = c.tx.Where("id = ?", id)
	}
	return c
}

func (c *ProductAttributeQueryBuilder) ByIds(ids []int) *ProductAttributeQueryBuilder {
	if len(ids) > 0 {
		c.tx = c.tx.Where("id IN (?)", ids)
	}
	return c
}

func (c *ProductAttributeQueryBuilder) ByName(name string) *ProductAttributeQueryBuilder {
	if len(name) > 0 {
		c.tx = c.tx.Where("lower(name) like ?", "%"+strings.ToLower(name)+"%")
	}
	return c
}

// PRELOAD
func (s *ProductAttributeQueryBuilder) Preloads(preloads []string) *ProductAttributeQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			s.tx = s.tx.Preload(preload)
		}
	}
	return s
}

// PAGINATION
func (c *ProductAttributeQueryBuilder) Offset(offset *int) *ProductAttributeQueryBuilder {
	if offset != nil {
		c.tx = c.tx.Offset(*offset)
	}
	return c
}

func (c *ProductAttributeQueryBuilder) Limit(limit *int) *ProductAttributeQueryBuilder {
	if limit != nil {
		c.tx = c.tx.Limit(*limit)
	}
	return c
}
