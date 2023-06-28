package dbStore

import (
	"time"

	"gorm.io/gorm/clause"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
)

func (d *DBStore) CreateScheduleMenu(scheduleMenu model.ScheduleMenu) (*model.ScheduleMenu, error) {
	if err := d.ormDB.
		Create(&scheduleMenu).Error; err != nil {
		return nil, err
	}

	return &scheduleMenu, nil
}

func (d *DBStore) UpdateScheduleMenu(scheduleMenu model.ScheduleMenu) (*model.ScheduleMenu, error) {
	scheduleMenu.UpdatedAt = time.Now()
	if err := d.ormDB.Model(&scheduleMenu).Updates(map[string]interface{}{
		"active":    scheduleMenu.Active,
		"inventory": scheduleMenu.Inventory,
		"price":     scheduleMenu.Price,
	}).Error; err != nil {
		return &scheduleMenu, err
	}
	return &scheduleMenu, nil
}

func (d *DBStore) FindScheduleMenu(params query.ScheduleMenuParams) (*model.ScheduleMenu, error) {
	var scheduleMenu model.ScheduleMenu

	tx := query.NewScheduleMenuQueryBuilder(d.ormDB).
		ByStoreId(params.StoreId).
		ByProductId(params.ProductId).
		ByWeekDay(params.WeekDay).
		Build()

	if err := tx.First(&scheduleMenu).Error; err != nil {
		return nil, err
	}
	return &scheduleMenu, nil
}

func (d *DBStore) FindScheduleMenus(params query.ScheduleMenuParams) ([]model.ScheduleMenu, error) {
	var scheduleMenus []model.ScheduleMenu

	tx := query.NewScheduleMenuQueryBuilder(d.ormDB).
		ByStoreId(params.StoreId).
		ByProductId(params.ProductId).
		ByWeekDay(params.WeekDay).
		PreloadProduct(true).
		Offset(params.Offset).
		Limit(params.Limit).
		OrderBy("productId", "asc").
		Build()

	if err := tx.Find(&scheduleMenus).Error; err != nil {
		return scheduleMenus, err
	}
	return scheduleMenus, nil
}

func (d *DBStore) CountScheduleMenus(params query.ScheduleMenuParams) (int64, error) {
	var count int64

	tx := query.NewScheduleMenuQueryBuilder(d.ormDB).
		ByStoreId(params.StoreId).
		ByProductId(params.ProductId).
		ByWeekDay(params.WeekDay).
		Build()

	if err := tx.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (d *DBStore) DeleteScheduleMenu(scheduleMenu model.ScheduleMenu) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.ScheduleMenu{
		StoreId:   scheduleMenu.StoreId,
		ProductId: scheduleMenu.ProductId,
		WeekDay:   scheduleMenu.WeekDay,
	}).Error
}

func (d *DBStore) ResetScheduleMenu(weekDay model.WeekDay) {
	scheduleMenus, err := d.FindScheduleMenus(query.ScheduleMenuParams{
		WeekDay: weekDay,
	})

	if err != nil {
		d.log.Error("Error: ResetScheduleMenu WeekDay: ", weekDay)
	}

	for _, scheduleMenu := range scheduleMenus {
		product := scheduleMenu.Product
		if err := d.ormDB.Model(&scheduleMenu).Updates(map[string]interface{}{
			"active":         product.IsGeneralMeal,
			"inventory":      product.Inventory,
			"price":          product.Price,
			"inventory_left": 0,
		}).Error; err != nil {
			d.log.Error("Error: ResetScheduleMenu ProductId: ", scheduleMenu.ProductId)
		}
	}
}
