package model

type CartItem struct {
	UserId    string `json:"userId" validate:"required" `
	ProductId int    `json:"productId" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required"`
	// Associations
	Product *Product `json:"product,omitempty" gorm:"foreignKey:ProductId;"`
}

func (CartItem) TableName() string {
	return "cart_item"
}

const (
	ProductAssociation = "Product"
)
