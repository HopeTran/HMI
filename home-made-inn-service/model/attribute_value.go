package model

type AttributeValue struct {
	Id          int    `json:"id" gorm:"primary_key"`
	AttributeId int    `json:"attributeId" `
	Name        string `json:"name"`
}

func (AttributeValue) TableName() string {
	return "attribute_value"
}
