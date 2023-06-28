package model

import (
	"time"
)

type Product struct {
	Id            int       `json:"id" gorm:"primary_key"`
	StoreId       int       `json:"storeId" validate:"required"`
	Name          string    `json:"name" validate:"required"`
	Description   string    `json:"description"`
	Price         float64   `json:"price"`
	Photo         string    `json:"photo"`
	Inventory     int       `json:"inventory"`
	IsGeneralMeal bool      `json:"isGeneralMeal"`
	RatingScore   *float64  `json:"ratingScore"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
	ParentId      int       `json:"parentId" validate:"required"`

	// Associations
	Ingredients   *[]Ingredient   `json:"ingredients,omitempty" gorm:"many2many:product_ingredient;"`
	Categories    *[]Category     `json:"categories,omitempty" gorm:"many2many:category_product;"`
	ScheduleMenus *[]ScheduleMenu `json:"scheduleMenus,omitempty" gorm:"foreignKey:ProductId;"`
	OrderDetail   *[]OrderDetail  `json:"orderDetails,omitempty" gorm:"foreignKey:ProductId;"`
	CartItems     *[]CartItem     `json:"cartItems,omitempty" gorm:"foreignKey:ProductId;"`
}

func (Product) TableName() string {
	return "product"
}

const (
	IngredientAssociation   = "Ingredients"
	CategoryAssociation     = "Categories"
	ScheduleMenuAssociation = "ScheduleMenus"
)
