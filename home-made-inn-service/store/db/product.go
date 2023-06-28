package dbStore

import (
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateProduct(product model.Product) (*model.Product, error) {

	if err := d.ormDB.
		Omit(fmt.Sprintf("%s.*", model.IngredientAssociation), fmt.Sprintf("%s.*", model.CategoryAssociation)).
		Create(&product).Error; err != nil {
		return nil, err
	}

	return &product, nil
}

func (d *DBStore) UpdateProduct(product model.Product) (*model.Product, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("id = ?", product.Id).Updates(&product).Updates(map[string]interface{}{
			"is_general_meal": product.IsGeneralMeal,
		}).Error; err != nil {
			return err
		}

		if product.Ingredients != nil {
			if err := tx.Omit(fmt.Sprintf("%s.*", model.IngredientAssociation)).Model(&product).Association(model.IngredientAssociation).Replace(product.Ingredients); err != nil {
				return err
			}
		}

		if product.Categories != nil {
			if err := tx.Omit(fmt.Sprintf("%s.*", model.CategoryAssociation)).Model(&product).Association(model.CategoryAssociation).Replace(product.Categories); err != nil {
				return err
			}
		}

		// Update schedule menu
		if product.IsGeneralMeal {
			tx.Model(&model.ScheduleMenu{}).Where("product_id = ?", product.Id).Updates(map[string]interface{}{
				"active": true,
			})
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (d *DBStore) FindProductById(params query.ProductParams) (*model.Product, error) {
	var product model.Product

	tx := query.NewProductQueryBuilder(d.ormDB).
		ById(params.Id).
		Preloads(params.Preloads).
		Build()

	if err := tx.First(&product).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (d *DBStore) FindProducts(params query.ProductParams) ([]model.Product, error) {
	var products []model.Product

	tx := query.NewProductQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByStoreId(params.StoreId).
		ByName(params.Name).
		Offset(params.Offset).
		Limit(params.Limit).
		Preloads(params.Preloads).
		Build()

	if err := tx.Find(&products).Error; err != nil {
		return products, err
	}
	return products, nil
}

func (d *DBStore) CountProducts(params query.ProductParams) (int64, error) {
	var count int64

	tx := query.NewProductQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByStoreId(params.StoreId).
		ByName(params.Name).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteProduct(id int) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.Product{
		Id: id,
	}).Error
}
