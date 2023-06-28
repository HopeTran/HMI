package dbStore

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateCartItem(cartItem model.CartItem) (*model.CartItem, error) {
	if err := d.ormDB.
		Create(&cartItem).Error; err != nil {
		return nil, err
	}
	return &cartItem, nil
}

func (d *DBStore) UpdateCartItems(cartItem model.CartItem) (*model.CartItem, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("product_id = ?", cartItem.ProductId).
			Where("user_id = ?", cartItem.UserId).
			Updates(&cartItem).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &cartItem, nil
}

func (d *DBStore) FindCartItems(params query.CartParams) ([]model.CartItem, error) {
	var cartItem []model.CartItem

	tx := query.NewCartQueryBuilder(d.ormDB).
		ByProductId(params.ProductId).
		ByUserId(params.UserId).
		Quantity(params.Quantity).
		Preloads(params.Preloads).
		Build()

	if err := tx.Preload("Product").Find(&cartItem).Error; err != nil {
		return cartItem, err
	}
	return cartItem, nil
}

func (d *DBStore) DeleteCartItem(userId string, productId int) error {

	return d.ormDB.Where("user_id = ? AND product_id = ?", userId, productId).Delete(&model.CartItem{}).Error
}
