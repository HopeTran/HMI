package query

import (
	"strings"

	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type StoreParams struct {
	Id              int      `form:"id"`
	Ids             []int    `form:"ids"`
	UserId          string   `form:"userId"`
	Name            string   `form:"name"`
	AvailableFrom   string   `form:"availableFrom"`
	AvailableTo     string   `form:"availableTo"`
	Offset          *int     `form:"offset"`
	Limit           *int     `form:"limit"`
	CountOnly       bool     `form:"countOnly"`
	WeekDay         string   `form:"weekDay"`
	Preloads        []string `form:"preloads"`
	FavoriteUserIds []string `form:"favoriteUserIds"`
	Active          bool     `form:"active"`
}

type StoreQueryBuilder struct {
	tx *gorm.DB
}

func NewStoreQueryBuilder(tx *gorm.DB) *StoreQueryBuilder {
	return &StoreQueryBuilder{tx: tx.Model(model.Store{})}
}

func (s *StoreQueryBuilder) Build() *gorm.DB {
	return s.tx
}

// FILTERS
func (s *StoreQueryBuilder) ById(id int) *StoreQueryBuilder {
	s.tx = s.tx.Where("id = ?", id)
	return s
}

func (s *StoreQueryBuilder) ByIds(ids []int) *StoreQueryBuilder {
	if len(ids) > 0 {
		s.tx = s.tx.Where("id IN (?)", ids)
	}
	return s
}

func (s *StoreQueryBuilder) ByUserId(userId string) *StoreQueryBuilder {
	if len(userId) > 0 {
		s.tx = s.tx.Where("user_id = ?", userId)
	}
	return s
}

func (s *StoreQueryBuilder) ByName(name string) *StoreQueryBuilder {
	if len(name) > 0 {
		s.tx = s.tx.Where("lower(name) like ?", "%"+strings.ToLower(name)+"%")
	}
	return s
}

func (s *StoreQueryBuilder) ByAvailableFrom(availableFrom string) *StoreQueryBuilder {
	if len(availableFrom) > 0 {
		s.tx = s.tx.Where("general_available_from >= ?", availableFrom)
	}
	return s
}

func (s *StoreQueryBuilder) ByAvailableTo(availableTo string) *StoreQueryBuilder {
	if len(availableTo) > 0 {
		s.tx = s.tx.Where("general_available_to >= ?", availableTo)
	}
	return s
}

func (s *StoreQueryBuilder) ByActiveStatus(active bool) *StoreQueryBuilder {
	s.tx = s.tx.Where("active = ? ", active)
	return s
}

// PRELOAD
func (s *StoreQueryBuilder) Preloads(preloads []string) *StoreQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			s.tx = s.tx.Preload(preload)
		}
	}
	return s
}

func (s *StoreQueryBuilder) ByWeekDay(weekDay string) *StoreQueryBuilder {
	if len(weekDay) > 0 {
		s.tx = s.tx.Preload("ScheduleMenus", "active = ? and week_day = ? ", true, weekDay)
	}
	return s
}

func (s *StoreQueryBuilder) ByFavortiteUserIds(favoriteUserIds []string) *StoreQueryBuilder {
	if len(favoriteUserIds) > 0 {
		s.tx = s.tx.Preload("FavoriteUsers", "id IN (?)", favoriteUserIds)
	}
	return s
}

// PAGINATION
func (s *StoreQueryBuilder) Offset(offset *int) *StoreQueryBuilder {
	if offset != nil {
		s.tx = s.tx.Offset(*offset)
	}
	return s
}

func (s *StoreQueryBuilder) Limit(limit *int) *StoreQueryBuilder {
	if limit != nil {
		s.tx = s.tx.Limit(*limit)
	}
	return s
}
