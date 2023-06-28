package dbStore

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateAttributeValue(attributeValue model.AttributeValue) (*model.AttributeValue, error) {
	if err := d.ormDB.
		Create(&attributeValue).Error; err != nil {
		return nil, err
	}
	return &attributeValue, nil
}

func (d *DBStore) UpdateAttributeValue(attributeValue model.AttributeValue) (*model.AttributeValue, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("id = ?", attributeValue.Id).Updates(&attributeValue).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &attributeValue, nil
}

func (d *DBStore) FindAttributeValueById(params query.AttributeValueParams) (*model.AttributeValue, error) {
	var attributeValue model.AttributeValue

	tx := query.NewAttributeValueQueryBuilder(d.ormDB).
		ByAttributeId(params.AttributeId).
		ById(params.Id).
		Build()

	if err := tx.First(&attributeValue).Error; err != nil {
		return nil, err
	}
	return &attributeValue, nil
}

func (d *DBStore) FindAttributeValues(params query.AttributeValueParams) ([]model.AttributeValue, error) {
	var attributeValues []model.AttributeValue

	tx := query.NewAttributeValueQueryBuilder(d.ormDB).
		ByAttributeId(params.AttributeId).
		ByIds(params.Ids).
		ByName(params.Name).
		Offset(params.Offset).
		Limit(params.Limit).
		Build()

	if err := tx.Find(&attributeValues).Error; err != nil {
		return attributeValues, err
	}
	return attributeValues, nil
}

func (d *DBStore) CountAttributeValues(params query.AttributeValueParams) (int64, error) {
	var count int64

	tx := query.NewAttributeValueQueryBuilder(d.ormDB).
		ByAttributeId(params.AttributeId).
		ByIds(params.Ids).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteAttributeValue(id int) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.AttributeValue{
		Id: id,
	}).Error
}
