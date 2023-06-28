package model

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	Id              string         `json:"id" gorm:"primary_key"`
	UserId          string         `json:"userId"`
	StoreId         int            `json:"storeId"`
	Subtotal        *float64       `json:"subTotal"`
	Status          OrderStatus    `json:"status"`
	Note            string         `json:"note"`
	Rating          *float64       `json:"rating"`
	CustomerAddress string         `json:"customerAddress"`
	CustomerPhone   string         `json:"customerPhone"`
	CustomerName    string         `json:"customerName"`
	Total           *float64       `json:"total"`
	DeliveryFee     *float64       `json:"deliveryFee"`
	DeliveryTime    string         `json:"deliveryTime"`
	WeekDay         WeekDay        `json:"weekDay"`
	Discount        *float64       `json:"discount"`
	DiscountCode    string         `json:"discountCode"`
	CancelReason    string         `json:"cancelReason"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `json:"deletedAt"`
	// Associations
	OrderDetail *[]OrderDetail `json:"orderDetails,omitempty" gorm:"foreignKey:OrderId;"`
	Store       Store          `json:"storeInfo,omitempty" gorm:"foreignKey:StoreId;"`
}

type OrderStatus string

const (
	WaitForPayment          OrderStatus = "wait_for_payment"
	Processing              OrderStatus = "processing"
	NeedToDelivery          OrderStatus = "need_to_delivery"
	Delivering              OrderStatus = "delivering"
	Arrived                 OrderStatus = "arrived"
	Completed               OrderStatus = "completed"
	Canceled                OrderStatus = "canceled"
	OrderDetailAssociations             = "OrderDetail"
	StoreAssociations                   = "Store"
)

func (Order) TableName() string {
	return "order"
}
