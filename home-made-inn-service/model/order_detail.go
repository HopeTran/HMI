package model

type OrderDetail struct {
	OrderId   string  `json:"orderId" gorm:"primary_key"`
	ProductId int     `json:"productId" gorm:"primary_key"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`

	Product *Product `json:"product,omitempty" gorm:"foreignKey:ProductId;"`
}

func (OrderDetail) TableName() string {
	return "order_detail"
}

const (
	ProductAssociations = "Product"
)
