package dbStore

import (
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateCategory(category model.Category) (*model.Category, error) {
	if err := d.ormDB.
		Omit(fmt.Sprintf("%s.*", model.ProductsAssociation)).
		Create(&category).Error; err != nil {
		return nil, err
	}

	return &category, nil
}

func (d *DBStore) UpdateCategory(category model.Category) (*model.Category, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("id = ?", category.Id).Updates(&category).Error; err != nil {
			return err
		}

		if category.Products != nil {
			if err := tx.Omit(fmt.Sprintf("%s.*", model.ProductsAssociation)).Model(&category).Association(model.ProductsAssociation).Replace(category.Products); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (d *DBStore) FindCategoryById(params query.CategoryParams) (*model.Category, error) {
	var category model.Category

	tx := query.NewCategoryQueryBuilder(d.ormDB).
		ById(params.Id).
		Preloads(params.Preloads).
		Build()

	if err := tx.First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (d *DBStore) FindCategories(params query.CategoryParams) ([]model.Category, error) {
	var categories []model.Category

	tx := query.NewCategoryQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByStoreId(params.StoreId).
		ByName(params.Name).
		Preloads(params.Preloads).
		Offset(params.Offset).
		Limit(params.Limit).
		Build()

	if err := tx.Find(&categories).Error; err != nil {
		return categories, err
	}
	return categories, nil
}

func (d *DBStore) CountCategories(params query.CategoryParams) (int64, error) {
	var count int64

	tx := query.NewCategoryQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteCategory(id int) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.Category{
		Id: id,
	}).Error
}
