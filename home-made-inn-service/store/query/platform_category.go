package query

import (
	"fmt"
	"sort"
	"strings"

	"golang.org/x/exp/slices"
	"gorm.io/gorm"

	"home-made-inn-service/model"
	"home-made-inn-service/util"
)

type PlatformCategoryParams struct {
	Id                   int            `form:"id"`
	Ids                  []int          `form:"ids"`
	Name                 string         `form:"name"`
	Offset               *int           `form:"offset"`
	Limit                *int           `form:"limit"`
	CountOnly            bool           `form:"countOnly"`
	WeekDay              string         `form:"weekDay"`
	DeliveryStartTime    string         `form:"deliveryStartTime"`
	DeliveryEndTime      string         `form:"deliveryEndTime"`
	SortValue            StoreSortField `form:"sortValue"`
	Rating               int            `form:"rating"`
	PriceFrom            int            `form:"priceFrom"`
	PriceTo              int            `form:"priceTo"`
	Cuisine              []int          `form:"cuisine"`
	Latitude             float64        `form:"latitude"`
	Longitude            float64        `form:"longitude"`
	SearchLocationRadius float64        `form:"searchLocationRadius"`
	NotIngredient        []string       `form:"notIngredient"`
	Currency             string         `form:"currency"`
}

type StoreSortField string

const (
	PickForYou   StoreSortField = "pick-for-you"
	MostPopular  StoreSortField = "most-popular"
	Rating       StoreSortField = "rating"
	DeliveryTime StoreSortField = "delivery-time"
)

type PlatformCategoryQueryBuilder struct {
	tx *gorm.DB
}

func NewPlatformCategoryQueryBuilder(tx *gorm.DB) *PlatformCategoryQueryBuilder {
	return &PlatformCategoryQueryBuilder{tx: tx.Model(model.PlatformCategory{})}
}

func (p *PlatformCategoryQueryBuilder) Build() *gorm.DB {
	return p.tx
}

// FILTERS
func (p *PlatformCategoryQueryBuilder) ById(id int) *PlatformCategoryQueryBuilder {
	p.tx = p.tx.Where("id = ?", id)
	return p
}

func (p *PlatformCategoryQueryBuilder) ByIds(ids []int) *PlatformCategoryQueryBuilder {
	if len(ids) > 0 {
		p.tx = p.tx.Where("id IN (?)", ids)
	}
	return p
}

func (p *PlatformCategoryQueryBuilder) ByName(name string) *PlatformCategoryQueryBuilder {
	if len(name) > 0 {
		p.tx = p.tx.Where("lower(name) like ?", "%"+strings.ToLower(name)+"%")
	}
	return p
}

// PAGINATION
func (p *PlatformCategoryQueryBuilder) Offset(offset *int) *PlatformCategoryQueryBuilder {
	if offset != nil {
		p.tx = p.tx.Offset(*offset)
	}
	return p
}

func (p *PlatformCategoryQueryBuilder) Limit(limit *int) *PlatformCategoryQueryBuilder {
	if limit != nil {
		p.tx = p.tx.Limit(*limit)
	}
	return p
}

func SortByValue(sortValue StoreSortField, platformCategories []model.PlatformCategory) []model.PlatformCategory {
	//sort by most popular or pick for you
	if sortValue == MostPopular {
		for _, pCat := range platformCategories {
			sort.SliceStable(pCat.Stores, func(i, j int) bool { return len(*pCat.Stores[i].Order) >= len(*pCat.Stores[j].Order) })
		}
	}
	return platformCategories
}

// Sort store by available time of store
func FilterByAvailableTime(platformCategories []model.PlatformCategory, deliveryStartTime string, deliveryEndTime string, weekDay string) []model.PlatformCategory {
	filterFromTime := util.GetHourFromStringTime(deliveryStartTime)
	filterToTime := util.GetHourFromStringTime(deliveryEndTime)
	for i, pCat := range platformCategories {
		stores := []model.Store{}
		//run loop to check store's available time
		for _, store := range pCat.Stores {
			idx := slices.IndexFunc(store.OperationTimes, func(c model.OperationTime) bool {
				availFromHrs := util.GetHourFromStringTime(fmt.Sprintln(c.AvailableFrom))
				availToHrs := util.GetHourFromStringTime(fmt.Sprintln(c.AvailableTo))
				isAvailable := filterFromTime < availToHrs || filterToTime > availFromHrs
				return string(c.WeekDay) == weekDay && isAvailable
			})

			if idx > -1 {
				stores = append(stores, store)
			}
		}
		platformCategories[i].Stores = stores
	}
	return platformCategories
}
