package web

import (
	"net/http"

	appError "github.com/NarrowPacific/common-go/app-error"
	"github.com/gin-gonic/gin"

	"home-made-inn-service/constant"
	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
	"home-made-inn-service/util"
)

func (s *Server) findScheduleMenu(c *gin.Context) {
	storeId := util.ParseInt(c.Param("storeId"))
	productId := util.ParseInt(c.Param("productId"))
	weekDay := c.Param("weekDay")

	product, err := s.dbStore.FindScheduleMenu(query.ScheduleMenuParams{
		StoreId:   storeId,
		ProductId: productId,
		WeekDay:   model.WeekDay(weekDay),
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, product)
	return
}

func (s *Server) findScheduleMenus(c *gin.Context) {
	storeId := util.ParseInt(c.Query("storeId"))
	productId := util.ParseInt(c.Query("productId"))
	weekDay := c.Query("weekDay")
	offset := util.ParseNullableInt(c.Query("offset"))
	limit := util.ParseNullableInt(c.Query("limit"))
	countOnly := util.ParseBool(c.Query("countOnly"))

	if countOnly {
		count, err := s.dbStore.CountScheduleMenus(query.ScheduleMenuParams{
			StoreId:   storeId,
			ProductId: productId,
			WeekDay:   model.WeekDay(weekDay),
		})
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	products, err := s.dbStore.FindScheduleMenus(query.ScheduleMenuParams{
		StoreId:   storeId,
		ProductId: productId,
		WeekDay:   model.WeekDay(weekDay),
		Offset:    offset,
		Limit:     limit,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, products)
	return
}

func (s *Server) createScheduleMenu(c *gin.Context) {
	var requestScheduleMenu model.ScheduleMenu
	if err := c.BindJSON(&requestScheduleMenu); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestScheduleMenu); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	product, err := s.dbStore.CreateScheduleMenu(requestScheduleMenu)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, product)
	return
}

func (s *Server) updateScheduleMenu(c *gin.Context) {
	var requestScheduleMenu model.ScheduleMenu
	if err := c.BindJSON(&requestScheduleMenu); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("storeId", requestScheduleMenu.StoreId, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	product, err := s.dbStore.UpdateScheduleMenu(requestScheduleMenu)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, product)
	return
}

func (s *Server) deleteScheduleMenu(c *gin.Context) {
	var requestScheduleMenu model.ScheduleMenu
	if err := c.BindJSON(&requestScheduleMenu); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	err := s.dbStore.DeleteScheduleMenu(requestScheduleMenu)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
