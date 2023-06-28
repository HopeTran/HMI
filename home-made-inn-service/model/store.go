package model

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Store struct {
	Id                   int             `json:"id" gorm:"primary_key"`
	UserId               string          `json:"userId" validate:"required"`
	Name                 string          `json:"name"`
	Logo                 string          `json:"logo"`
	Description          string          `json:"description"`
	CountryCode          string          `json:"countryCode"`
	Address              string          `json:"address"`
	Location             string          `json:"location"`
	Phone                string          `json:"phone"`
	Photo                string          `json:"photo"`
	GeneralAvailableFrom *datatypes.Time `json:"generalAvailableFrom"`
	GeneralAvailableTo   *datatypes.Time `json:"generalAvailableTo"`
	Tags                 *pq.StringArray `json:"tags" gorm:"type:text[]"`
	RatingScore          *float64        `json:"ratingScore"`
	TotalKm              *float64        `json:"totalKm"`
	Latitude             float64         `json:"latitude"`
	Longitude            float64         `json:"longitude"`
	Active               bool            `json:"active"`
	CreatedAt            time.Time       `json:"createdAt"`
	UpdatedAt            time.Time       `json:"updatedAt"`
	DeletedAt            gorm.DeletedAt  `json:"deletedAt" gorm:"index"`
	Currency             string          `json:"currency"`

	// Associations
	PlatformCategories *[]PlatformCategory `json:"platformCategories,omitempty" gorm:"many2many:store_platform_category;"`
	Cuisines           *[]Cuisine          `json:"cuisines,omitempty" gorm:"many2many:store_cuisine;"`
	Categories         *[]Category         `json:"categories,omitempty" gorm:"foreignKey:StoreId;"`
	OperationTimes     []OperationTime     `json:"operationTimes,omitempty" gorm:"foreignKey:StoreId;"`
	Order              *[]Order            `json:"-" gorm:"foreignKey:StoreId;"`
	ScheduleMenus      *[]ScheduleMenu     `json:"scheduleMenus,omitempty" gorm:"foreignKey:StoreId"`
	FavoriteUsers      *[]User             `json:"favoriteUsers,omitempty" gorm:"many2many:favorite_store;"`
}

func (Store) TableName() string {
	return "store"
}

const (
	PlatformCategoryAssociation = "PlatformCategories"
	CuisineAssociation          = "Cuisines"
	OperationTimeAssociation    = "OperationTimes"
	TotalKm                     = "TotalKm"
)
