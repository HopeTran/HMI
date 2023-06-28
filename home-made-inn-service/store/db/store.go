package dbStore

import (
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateStore(store model.Store) (*model.Store, error) {
	if err := d.ormDB.
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "user_id"}},
			DoUpdates: clause.Assignments(map[string]interface{}{"active": true}),
		}).
		Omit(
			fmt.Sprintf("%s.*", model.PlatformCategoryAssociation),
			fmt.Sprintf("%s.*", model.CuisineAssociation),
			model.TotalKm).
		Create(&store).Error; err != nil {
		return nil, err
	}

	return &store, nil
}

func (d *DBStore) UpdateStore(store model.Store) (*model.Store, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("id = ?", store.Id).Updates(&store).Error; err != nil {
			return err
		}

		if store.PlatformCategories != nil {
			if err := tx.Omit(fmt.Sprintf("%s.*", model.PlatformCategoryAssociation)).Model(&store).Association(model.PlatformCategoryAssociation).Replace(store.PlatformCategories); err != nil {
				return err
			}
		}

		if store.Cuisines != nil {
			if err := tx.Omit(fmt.Sprintf("%s.*", model.CuisineAssociation)).Model(&store).Association(model.CuisineAssociation).Replace(store.Cuisines); err != nil {
				return err
			}
		}

		if store.OperationTimes != nil {
			err := tx.Where("store_id = ?", store.Id).Delete(model.OperationTime{}).Error
			if err != nil {
				return err
			}
			if len(store.OperationTimes) > 0 {
				return tx.Clauses((clause.OnConflict{
					DoNothing: true,
				})).Save(store.OperationTimes).Error
			}

		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &store, nil
}

func (d *DBStore) FindStoreById(params query.StoreParams) (*model.Store, error) {
	var store model.Store

	tx := query.NewStoreQueryBuilder(d.ormDB).
		ById(params.Id).
		ByUserId(params.UserId).
		Offset(params.Offset).
		ByFavortiteUserIds(params.FavoriteUserIds).
		ByWeekDay(params.WeekDay).
		Preloads(params.Preloads).
		Build()

	if err := tx.Find(&store).Error; err != nil {
		return &store, err
	}

	return &store, nil
}

func (d *DBStore) FindStores(params query.StoreParams) ([]model.Store, error) {
	var stores []model.Store

	tx := query.NewStoreQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByUserId(params.UserId).
		ByName(params.Name).
		ByAvailableFrom(params.AvailableFrom).
		ByAvailableTo(params.AvailableTo).
		ByActiveStatus(params.Active).
		Offset(params.Offset).
		Limit(params.Limit).
		ByWeekDay(params.WeekDay).
		Preloads(params.Preloads).
		Build()

	if err := tx.Find(&stores).Error; err != nil {
		return stores, err
	}

	return stores, nil
}

func (d *DBStore) CountStores(params query.StoreParams) (int64, error) {
	var count int64

	tx := query.NewStoreQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		ByUserId(params.UserId).
		ByName(params.Name).
		ByAvailableFrom(params.AvailableFrom).
		ByAvailableTo(params.AvailableTo).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteStore(id int) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.Store{
		Id: id,
	}).Error
}
