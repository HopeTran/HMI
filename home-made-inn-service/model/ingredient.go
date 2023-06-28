package model

type Ingredient struct {
	Id          int    `json:"id" gorm:"primary_key"`
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
}

func (Ingredient) TableName() string {
	return "ingredient"
}
