package dbStore

import (
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreatePlatformCategory(platformCategory model.PlatformCategory) (*model.PlatformCategory, error) {
	if err := d.ormDB.
		Omit(fmt.Sprintf("%s.*", model.PlatformStoreAssociations)).
		Create(&platformCategory).Error; err != nil {
		return nil, err
	}

	return &platformCategory, nil
}

func (d *DBStore) UpdatePlatformCategory(platformCategory model.PlatformCategory) (*model.PlatformCategory, error) {
	if err := d.ormDB.
		Where("id = ?", platformCategory.Id).Updates(&platformCategory).Error; err != nil {
		return nil, err
	}

	return &platformCategory, nil
}

func (d *DBStore) FindPlatformCategoryById(params query.PlatformCategoryParams) (*model.PlatformCategory, error) {
	var platformCategory model.PlatformCategory

	tx := query.NewPlatformCategoryQueryBuilder(d.ormDB).
		ById(params.Id).
		Build()

	if err := tx.First(&platformCategory).Error; err != nil {
		return nil, err
	}
	return &platformCategory, nil
}

func (d *DBStore) FindPlatformCategories(params query.PlatformCategoryParams) ([]model.PlatformCategory, error) {
	var platformCategories []model.PlatformCategory

	tx := query.NewPlatformCategoryQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByName(params.Name).
		Offset(params.Offset).
		Limit(params.Limit).
		Build()

	if err := tx.Preload("Stores", "st_distancesphere(ST_MakePoint(store.longitude, store.latitude),ST_MakePoint(?, ?)) <= ?", params.Longitude, params.Latitude, params.SearchLocationRadius*1000, func(db *gorm.DB) *gorm.DB {
		storeQuery := db.Distinct("store.*, st_distancesphere(ST_MakePoint(store.longitude, store.latitude),ST_MakePoint(?, ?))/1000 as total_km", params.Longitude, params.Latitude).Where("store.active = ?", true)
		if len(params.WeekDay) > 0 {
			storeQuery = storeQuery.Joins("JOIN operation_time ON operation_time.store_id = store.id").
				Where("operation_time.week_day = ?", params.WeekDay)
		}
		if params.Rating > 0 {
			storeQuery = storeQuery.Where("store.rating_score >= ? ", params.Rating)
		}
		if len(params.Currency) > 0 {
			storeQuery = storeQuery.Where("store.currency = ? ", params.Currency)
		}
		if len(params.Cuisine) > 0 {
			storeQuery = storeQuery.Joins("JOIN store_cuisine ON store_cuisine.store_id = store.id AND store_cuisine.cuisine_id IN (?)", params.Cuisine)
		}
		if params.PriceTo > 0 {
			storeQuery = storeQuery.Joins("JOIN product ON product.store_id = store.id").
				Where("product.price >= ? AND product.price <= ?", params.PriceFrom, params.PriceTo)
		}

		// Sort
		if params.SortValue == query.Rating || params.SortValue == query.PickForYou {
			storeQuery = storeQuery.Order("store.rating_score DESC NULLS LAST")
		}
		return storeQuery
	}).Preload("Stores.OperationTimes").Preload("Stores.Order").Find(&platformCategories).Error; err != nil {
		return platformCategories, err
	}

	if len(params.WeekDay) > 0 {
		query.FilterByAvailableTime(platformCategories, params.DeliveryStartTime, params.DeliveryEndTime, params.WeekDay)
	}

	// TODO: implement for delivery time sort
	if params.SortValue == query.MostPopular {
		query.SortByValue(params.SortValue, platformCategories)
	}

	return platformCategories, nil
}

func (d *DBStore) CountPlatformCategories(params query.PlatformCategoryParams) (int64, error) {
	var count int64

	tx := query.NewPlatformCategoryQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByName(params.Name).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeletePlatformCategory(id int) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.PlatformCategory{
		Id: id,
	}).Error
}
