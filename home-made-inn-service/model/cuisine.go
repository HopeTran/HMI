package model

type Cuisine struct {
	Id   int    `json:"id" gorm:"primary_key"`
	Name string `json:"name" validate:"required"`
	// Associations
	Stores []Store `json:"stores,omitempty" gorm:"many2many:store_cuisine;"`
}

func (Cuisine) TableName() string {
	return "cuisine"
}
