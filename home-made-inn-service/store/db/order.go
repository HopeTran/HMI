package dbStore

import (
	"errors"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"home-made-inn-service/constant"
	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
	"home-made-inn-service/util"
)

func (d *DBStore) CreateOrder(order model.Order) (*model.Order, error) {

	if err := d.BeginAndCommit(func(tx *gorm.DB) error {
		for index, orderDetail := range *order.OrderDetail {
			var scheduleMenu model.ScheduleMenu
			if err := tx.Where("store_id = ? and product_id = ? and week_day = ?", order.StoreId, orderDetail.ProductId, order.WeekDay).First(&scheduleMenu).Error; err != nil {
				return err
			}
			if !scheduleMenu.Active {
				return errors.New(constant.ProductIsNotAvailable)
			}

			(*order.OrderDetail)[index].Price = scheduleMenu.Price

			scheduleMenu.InventoryLeft = scheduleMenu.InventoryLeft + orderDetail.Quantity
			if scheduleMenu.InventoryLeft > scheduleMenu.Inventory {
				return errors.New(constant.OutOfStock)
			}

			tx.Updates(&scheduleMenu)
		}
		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		return nil, err
	}

	return &order, nil
}

func (d *DBStore) UpdateOrder(order model.Order) (*model.Order, error) {
	err := d.BeginAndCommit(func(tx *gorm.DB) error {
		if err := tx.
			Omit(clause.Associations).
			Where("id = ?", order.Id).
			Updates(&order).Error; err != nil {
			return err
		}

		if order.Status == model.Canceled {
			for _, orderDetail := range *order.OrderDetail {
				if err := tx.Model(model.ScheduleMenu{}).Where("store_id = ? and product_id = ? and week_day = ?", order.StoreId, orderDetail.ProductId, order.WeekDay).Updates(map[string]interface{}{"inventory_left": gorm.Expr("inventory_left - ?", orderDetail.Quantity)}).Error; err != nil {
					return err
				}
			}
		} else if order.OrderDetail != nil {
			if err := tx.Omit(fmt.Sprintf("%s.*", model.OrderDetailAssociations)).Model(&order).Association(model.OrderDetailAssociations).Replace(order.OrderDetail); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (d *DBStore) FindOrders(params query.OrderParams) ([]model.Order, error) {
	var orders []model.Order

	tx := query.NewOrderQueryBuilder(d.ormDB).
		ByOrderId(params.Id).
		ByUserId(params.UserId).
		ByStatus(params.Status).
		ByStoreId(params.StoreId).
		Preloads(params.Preloads).
		OrderBy("updated_at", params.Ordering).
		Build()

	if err := tx.Preload("OrderDetail").Preload("OrderDetail.Product").Preload("Store").Find(&orders).Error; err != nil {
		return orders, err
	}

	return orders, nil
}

func (d *DBStore) GetProfitSummary(storeId int, typeProfit string, timeProfit string) (model.ProfitSummary, error) {

	result := model.ProfitSummary{}

	selectQuery := "SELECT extract(year FROM updated_at) as year, extract(month from updated_at) as month, extract(day from updated_at) as week, order_id as order_id, product_id as product_id,"
	selectFrom := " FROM public.order"
	joinClause := " c join public.order_detail i on c.id = i.order_id"
	whereClause := fmt.Sprintf(" where store_id = %d and status = 'completed'", storeId)
	groupByClause := " group by (year, month, week, order_id, product_id, profit)"
	thisWeekProfitClause := " and updated_at >= (NOW() - INTERVAL '7 DAYS') AND updated_at < NOW()"
	lastWeekProfitClause := " and updated_at <= (NOW() - INTERVAL '7 DAYS') AND updated_at >= (NOW() - INTERVAL '14 DAYS')"

	if typeProfit == "gross" {
		selectQuery += fmt.Sprintf(" subtotal as profit")
	}
	if typeProfit == "total" {
		selectQuery += fmt.Sprintf(" quantity as profit")
	}

	txThisWeek := d.ormDB.Raw(selectQuery + selectFrom + joinClause + whereClause + thisWeekProfitClause + groupByClause)

	if err := txThisWeek.Scan(&result.ThisWeek).Error; err != nil {
		return result, err
	}

	if result.ThisWeek != nil {
		result.ThisWeek = util.ProfitDataMap(result.ThisWeek, "thisWeek")
	}

	txLastWeek := d.ormDB.Raw(selectQuery + selectFrom + joinClause + whereClause + lastWeekProfitClause + groupByClause)

	if err := txLastWeek.Scan(&result.LastWeek).Error; err != nil {
		return result, err
	}

	if result.LastWeek != nil {
		result.LastWeek = util.ProfitDataMap(result.LastWeek, "lastWeek")
	}

	return result, nil
}

func (d *DBStore) FindOrdersByStoreId(params query.OrderParams) ([]model.Order, error) {
	var orders []model.Order

	tx := query.NewOrderQueryBuilder(d.ormDB).
		ByStoreId(params.StoreId).
		Preloads(params.Preloads).
		Build()

	if err := tx.Preload("OrderDetail").Preload("OrderDetail.Product").Preload("Store").Find(&orders).Error; err != nil {
		return orders, err
	}

	return orders, nil
}

func (d *DBStore) FindOrderById(param query.OrderParams) ([]model.Order, error) {
	var order []model.Order

	tx := query.NewOrderQueryBuilder(d.ormDB).
		ByOrderId(param.Id).
		Preloads(param.Preloads).
		Build()

	if err := tx.Preload("OrderDetail").Preload("OrderDetail.Product").Find(&order).Error; err != nil {
		return order, err
	}

	return order, nil
}

func (d *DBStore) DeleteOrder(id string) error {
	return d.ormDB.Select(clause.Associations).Delete(&model.Order{
		Id: id,
	}).Error
}
