package dbStore

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateAttribute(attribute model.Attribute) (*model.Attribute, error) {
	if err := d.ormDB.
		Create(&attribute).Error; err != nil {
		return nil, err
	}

	return &attribute, nil
}

func (d *DBStore) UpdateAttribute(attribute model.Attribute) (*model.Attribute, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("id = ?", attribute.Id).Updates(&attribute).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &attribute, nil
}

func (d *DBStore) FindAttributeById(params query.AttributeParams) (*model.Attribute, error) {
	var attribute model.Attribute

	tx := query.NewAttributeQueryBuilder(d.ormDB).
		ById(params.Id).
		Build()

	if err := tx.First(&attribute).Error; err != nil {
		return nil, err
	}
	return &attribute, nil
}

func (d *DBStore) FindAttributes(params query.AttributeParams) ([]model.Attribute, error) {
	var attributes []model.Attribute

	tx := query.NewAttributeQueryBuilder(d.ormDB).
		ById(params.Id).
		ByIds(params.Ids).
		ByName(params.Name).
		Offset(params.Offset).
		Limit(params.Limit).
		Build()

	if err := tx.Preload("AttributeValues").Find(&attributes).Error; err != nil {
		return attributes, err
	}
	return attributes, nil
}

func (d *DBStore) CountAttributes(params query.AttributeParams) (int64, error) {
	var count int64

	tx := query.NewAttributeQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByName(params.Name).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteAttribute(id int) error {
	err := d.ormDB.Select(clause.Associations).Delete(&model.Attribute{
		Id: id,
	}).Error

	return err
}
