package query

import (
	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type ScheduleMenuParams struct {
	StoreId   int
	ProductId int
	WeekDay   model.WeekDay
	Offset    *int
	Limit     *int
}

type ScheduleMenuQueryBuilder struct {
	tx *gorm.DB
}

func NewScheduleMenuQueryBuilder(tx *gorm.DB) *ScheduleMenuQueryBuilder {
	return &ScheduleMenuQueryBuilder{tx: tx.Model(model.ScheduleMenu{})}
}

func (s *ScheduleMenuQueryBuilder) Build() *gorm.DB {
	return s.tx
}

// FILTERS
func (s *ScheduleMenuQueryBuilder) ByStoreId(storeId int) *ScheduleMenuQueryBuilder {
	if storeId > 0 {
		s.tx = s.tx.Where("store_id = ?", storeId)
	}
	return s
}

func (s *ScheduleMenuQueryBuilder) ByProductId(productId int) *ScheduleMenuQueryBuilder {
	if productId > 0 {
		s.tx = s.tx.Where("product_id = ?", productId)
	}
	return s
}

func (s *ScheduleMenuQueryBuilder) ByWeekDay(weekDay model.WeekDay) *ScheduleMenuQueryBuilder {
	if len(weekDay) > 0 {
		s.tx = s.tx.Where("week_day = ?", weekDay)
	}
	return s
}

func (a *ScheduleMenuQueryBuilder) PreloadProduct(included bool) *ScheduleMenuQueryBuilder {
	if included {
		a.tx = a.tx.Preload("Product").Preload("Product.Categories")
	}

	return a
}

// PAGINATION
func (s *ScheduleMenuQueryBuilder) Offset(offset *int) *ScheduleMenuQueryBuilder {
	if offset != nil {
		s.tx = s.tx.Offset(*offset)
	}
	return s
}

func (s *ScheduleMenuQueryBuilder) Limit(limit *int) *ScheduleMenuQueryBuilder {
	if limit != nil {
		s.tx = s.tx.Limit(*limit)
	}
	return s
}

func (s *ScheduleMenuQueryBuilder) OrderBy(fieldName string, ordering string) *ScheduleMenuQueryBuilder {
	if len(fieldName) > 0 && len(ordering) > 0 {
		strOrder := fieldName
		switch fieldName {
		case "createdAt":
			strOrder = "created_at"
		case "updatedAt":
			strOrder = "updated_at"
		case "productId":
			strOrder = "product_id"
		}
		s.tx = s.tx.Order(strOrder + " " + ordering)
	}
	return s
}
