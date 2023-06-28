package dbStore

import (
	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateUser(user model.User) (*model.User, error) {
	if err := d.ormDB.Clauses(clause.OnConflict{DoNothing: true}).Create(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (d *DBStore) UpdateUser(user model.User) (*model.User, error) {
	if err := d.ormDB.
		Where("id = ?", user.Id).Updates(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (d *DBStore) FindUserById(userId string, extraParams query.UserParams) (*model.User, error) {
	var user model.User

	tx := query.NewUserQueryBuilder(d.ormDB).
		ById(userId).
		Preloads(extraParams.Preloads).
		Build()

	if err := tx.First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (d *DBStore) FindUsers(params query.UserParams) ([]model.User, error) {
	var users []model.User

	tx := query.NewUserQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		Offset(params.Offset).
		Preloads(params.Preloads).
		Limit(params.Limit).
		Build()

	if err := tx.Find(&users).Error; err != nil {
		return users, err
	}
	return users, nil
}

func (d *DBStore) CountUsers(params query.UserParams) (int64, error) {
	var count int64

	tx := query.NewUserQueryBuilder(d.ormDB).
		ByIds(params.Ids).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteUser(id string) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.User{
		Id: id,
	}).Error
}

func (d *DBStore) AddFavoriteStore(userId string, storeId int) error {
	var user model.User
	err := d.ormDB.Where("id = ?", userId).Preload("FavoriteStores").Find(&user).Error
	if err != nil {
		return err
	}
	store := model.Store{Id: storeId}
	err = d.ormDB.Find(&store).Error
	if err != nil {
		return err
	}
	*user.FavoriteStores = append(*user.FavoriteStores, store)
	err = d.ormDB.Omit("FavoriteStores.*").Save(&user).Error
	return err
}

func (d *DBStore) RemoveFavoriteStore(userId string, storeId int) error {
	user := model.User{Id: userId}
	err := d.ormDB.Preload("FavoriteStores").Find(&user).Error
	if err != nil {
		return err
	}

	err = d.ormDB.Model(&user).Association("FavoriteStores").Delete(&model.Store{Id: storeId})
	return err
}
