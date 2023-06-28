package query

import (
	"gorm.io/gorm"

	"home-made-inn-service/model"
)

type UserParams struct {
	Id        string   `form:"id"`
	Ids       []string `form:"ids"`
	Preloads  []string `form:"preloads"`
	Offset    *int     `form:"offset"`
	Limit     *int     `form:"limit"`
	CountOnly bool     `form:"countOnly"`
}

type UserQueryBuilder struct {
	tx *gorm.DB
}

func NewUserQueryBuilder(tx *gorm.DB) *UserQueryBuilder {
	return &UserQueryBuilder{tx: tx.Model(model.User{})}
}

func (u *UserQueryBuilder) Build() *gorm.DB {
	return u.tx
}

// FILTERS
func (u *UserQueryBuilder) ById(id string) *UserQueryBuilder {
	if len(id) > 0 {
		u.tx = u.tx.Where("id = ?", id)
	}
	return u
}

func (u *UserQueryBuilder) ByIds(ids []string) *UserQueryBuilder {
	if len(ids) > 0 {
		u.tx = u.tx.Where("id IN (?)", ids)
	}
	return u
}

func (s *UserQueryBuilder) Preloads(preloads []string) *UserQueryBuilder {
	if len(preloads) > 0 {
		for _, preload := range preloads {
			s.tx = s.tx.Preload(preload)
		}
	}
	return s
}

// PAGINATION
func (u *UserQueryBuilder) Offset(offset *int) *UserQueryBuilder {
	if offset != nil {
		u.tx = u.tx.Offset(*offset)
	}
	return u
}

func (u *UserQueryBuilder) Limit(limit *int) *UserQueryBuilder {
	if limit != nil {
		u.tx = u.tx.Limit(*limit)
	}
	return u
}
