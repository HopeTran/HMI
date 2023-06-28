package dbStore

import (
	"home-made-inn-service/model"
)

func (db *DBStore) CreateUserDeliveryAddress(addressInfo model.UserDeliveryAddress) error {
	return db.ormDB.Create(&addressInfo).Error
}

func (db *DBStore) UpdateUserDeliveryAddress(addressInfo model.UserDeliveryAddress) error {
	return db.ormDB.Model(&addressInfo).Select("*").Updates(&addressInfo).Error
}

func (db *DBStore) DeleteUserDeliveryAddress(addressID uint64) error {
	if err := db.ormDB.First(&model.UserDeliveryAddress{ID: addressID}).Error; err != nil {
		return err
	}
	return db.ormDB.Delete(&model.UserDeliveryAddress{ID: addressID}).Error
}

func (db *DBStore) FindAllUserDeliveryAddresses(userId string) ([]model.UserDeliveryAddress, error) {
	var addresses []model.UserDeliveryAddress

	err := db.ormDB.Model(&model.UserDeliveryAddress{}).Where(model.UserDeliveryAddress{UserId: userId}).Find(&addresses).Error
	if err != nil {
		return addresses, err
	}

	return addresses, nil
}
