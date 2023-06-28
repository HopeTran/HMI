package model

import "time"

type AddressType string

const (
	Star   AddressType = "address_type_star"
	Home   AddressType = "address_type_home"
	Office AddressType = "address_type_office"
	Other  AddressType = "address_type_other"
)

type DeliveryPlace string

const (
	MeetAtDoor  DeliveryPlace = "delivery_place_meet_at_door"
	MeetOutside DeliveryPlace = "delivery_place_meet_outside"
	LeaveAtDoor DeliveryPlace = "delivery_place_leave_at_door"
)

type UserDeliveryAddress struct {
	ID                  uint64        `json:"id" gorm:"primary_key"`
	UserId              string        `json:"userId"`
	AddressType         AddressType   `json:"addressType"`
	Label               string        `json:"label"`
	AddressText         string        `json:"addressText"`
	Latitude            float64       `json:"latitude"`
	Longitude           float64       `json:"longitude"`
	DeliveryPlace       DeliveryPlace `json:"deliveryPlace"`
	DeliveryContactName string        `json:"deliveryContactName"`
	DeliveryInstruction string        `json:"deliveryInstruction"`
	CreatedAt           time.Time     `json:"createdAt"`
	UpdatedAt           time.Time     `json:"updatedAt"`
}

func (UserDeliveryAddress) TableName() string {
	return "user_delivery_address"
}
