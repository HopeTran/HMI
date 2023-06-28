package model

import (
	"time"

	"gorm.io/datatypes"
)

type OperationTime struct {
	StoreId       int             `json:"storeId" gorm:"primary_key" validate:"required"`
	WeekDay       WeekDay         `json:"weekDay" gorm:"primary_key" validate:"required"`
	AvailableFrom *datatypes.Time `json:"availableFrom"`
	AvailableTo   *datatypes.Time `json:"availableTo"`
	CreatedAt     time.Time       `json:"-"`
	UpdatedAt     time.Time       `json:"-"`
}

func (OperationTime) TableName() string {
	return "operation_time"
}

type WeekDay string

const (
	Mon WeekDay = "MON"
	Tue WeekDay = "TUE"
	Wed WeekDay = "WED"
	Thu WeekDay = "THU"
	Fri WeekDay = "FRI"
	Sat WeekDay = "SAT"
	Sun WeekDay = "SUN"
)
