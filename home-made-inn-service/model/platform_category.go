package model

import (
	"time"
)

type PlatformCategory struct {
	Id          int       `json:"id" gorm:"primary_key"`
	Name        string    `json:"name" validate:"required"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	// Associations
	Stores []Store `json:"stores,omitempty" gorm:"many2many:store_platform_category;"`
}

func (PlatformCategory) TableName() string {
	return "platform_category"
}

const (
	PlatformStoreAssociations = "Stores"
)
