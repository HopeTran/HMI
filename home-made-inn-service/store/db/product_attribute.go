package dbStore

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateProductAttribute(productAttribute model.ProductAttribute) (*model.ProductAttribute, error) {
	if err := d.ormDB.
		Create(&productAttribute).Error; err != nil {
		return nil, err
	}
	return &productAttribute, nil
}

func (d *DBStore) UpdateProductAttribute(productAttribute model.ProductAttribute) (*model.ProductAttribute, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("id = ?", productAttribute.Id).Updates(&productAttribute).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &productAttribute, nil
}

func (d *DBStore) FindProductAttributeById(params query.ProductAttributeParams) (*model.ProductAttribute, error) {
	var productAttribute model.ProductAttribute

	tx := query.NewProductAttributeQueryBuilder(d.ormDB).
		ById(params.Id).
		Build()

	if err := tx.First(&productAttribute).Error; err != nil {
		return nil, err
	}
	return &productAttribute, nil
}

func (d *DBStore) FindProductAttributes(params query.ProductAttributeParams) ([]model.ProductAttribute, error) {
	var productAttributes []model.ProductAttribute

	tx := query.NewProductAttributeQueryBuilder(d.ormDB).
		ById(params.Id).
		ByIds(params.Ids).
		Offset(params.Offset).
		Limit(params.Limit).
		Build()

	if err := tx.Find(&productAttributes).Error; err != nil {
		return productAttributes, err
	}
	return productAttributes, nil
}

func (d *DBStore) DeleteProductAttribute(id int) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.ProductAttribute{
		Id: id,
	}).Error
}

func (d *DBStore) CountProductAttributes(params query.ProductAttributeParams) (int64, error) {
	var count int64

	tx := query.NewProductAttributeQueryBuilder(d.ormDB).
		ById(params.Id).
		ByIds(params.Ids).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
