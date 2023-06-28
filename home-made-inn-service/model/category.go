package model

import (
	"time"
)

type Category struct {
	Id        int       `json:"id" gorm:"primary_key"`
	StoreId   int       `json:"storeId" validate:"required"`
	Name      string    `json:"name" validate:"required"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// Associations
	Products *[]Product `json:"products,omitempty" gorm:"many2many:category_product;"`
}

func (Category) TableName() string {
	return "category"
}

const (
	ProductsAssociation = "Products"
)
