package model

type ProductAttribute struct {
	Id               int     `json:"id" gorm:"primary_key"`
	StoreId          int     `json:"storeId" validate:"required"`
	AttributeId      int     `json:"attributeId" validate:"required"`
	AttributeValueId int     `json:"attributeValueId" validate:"required"`
	ProductId        int     `json:"productId" validate:"required"`
	Description      string  `json:"description"`
	Price            float64 `json:"price"`
	Photo            string  `json:"photo"`
	Inventory        int     `json:"inventory"`
	InventoryLeft    int     `json:"inventoryLeft"`
}

func (ProductAttribute) TableName() string {
	return "product_attribute"
}
