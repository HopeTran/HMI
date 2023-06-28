package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	Id        string         `json:"id" gorm:"primary_key"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	FavoriteStores    *[]Store               `json:"favoriteStores,omitempty" gorm:"many2many:favorite_store;"`
	DeliveryAddresses *[]UserDeliveryAddress `json:"deliveryAddresses,omitempty" gorm:"foreignKey:UserId"`
}

func (User) TableName() string {
	return "user"
}
