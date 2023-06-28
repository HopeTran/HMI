package model

import (
	"time"
)

type ScheduleMenu struct {
	StoreId       int       `json:"storeId" gorm:"primary_key" validate:"required"`
	ProductId     int       `json:"productId" gorm:"primary_key" validate:"required"`
	WeekDay       WeekDay   `json:"weekDay" gorm:"primary_key" validate:"required"`
	Price         float64   `json:"price"`
	Inventory     int       `json:"inventory"`
	InventoryLeft int       `json:"inventoryLeft"`
	Active        bool      `json:"active"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
	Product       Product   `json:"product" gorm:"foreignKey:ProductId"`
}

func (ScheduleMenu) TableName() string {
	return "schedule_menu"
}
