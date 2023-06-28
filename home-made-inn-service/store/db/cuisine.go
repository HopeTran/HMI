package dbStore

import (
	"home-made-inn-service/model"
	"home-made-inn-service/store/query"

	"gorm.io/gorm/clause"
)

func (d *DBStore) CreateCuisine(cuisine model.Cuisine) (*model.Cuisine, error) {
	if err := d.ormDB.
		Create(&cuisine).Error; err != nil {
		return nil, err
	}

	return &cuisine, nil
}

func (d *DBStore) UpdateCuisine(cuisine model.Cuisine) (*model.Cuisine, error) {
	if err := d.ormDB.
		Where("id = ?", cuisine.Id).Updates(&cuisine).Error; err != nil {
		return nil, err
	}

	return &cuisine, nil
}

func (d *DBStore) FindCuisineById(params query.CuisineParams) (*model.Cuisine, error) {
	var cuisine model.Cuisine

	tx := query.NewCuisineQueryBuilder(d.ormDB).
		ById(params.Id).
		Build()

	if err := tx.First(&cuisine).Error; err != nil {
		return nil, err
	}
	return &cuisine, nil
}

func (d *DBStore) FindCuisines(params query.CuisineParams) ([]model.Cuisine, error) {
	var cuisines []model.Cuisine

	tx := query.NewCuisineQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		Offset(params.Offset).
		Limit(params.Limit).
		Build()

	if err := tx.Find(&cuisines).Error; err != nil {
		return cuisines, err
	}
	return cuisines, nil
}

func (d *DBStore) CountCuisines(params query.CuisineParams) (int64, error) {
	var count int64

	tx := query.NewCuisineQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteCuisine(id int) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.Cuisine{
		Id: id,
	}).Error
}
