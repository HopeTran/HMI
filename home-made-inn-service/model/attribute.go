package model

type Attribute struct {
	Id    int    `json:"id" gorm:"primary_key"`
	Name  string `json:"name" validate:"required"`
	Label string `json:"label"`

	AttributeValues []AttributeValue `json:"attributeValues,omitempty" gorm:"foreignKey:AttributeId;"`
}

func (Attribute) TableName() string {
	return "attribute"
}

const (
	AttributeValuesAssociation = "AttributeValue"
)
