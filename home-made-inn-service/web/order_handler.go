package web

import (
	"net/http"

	appError "github.com/NarrowPacific/common-go/app-error"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"home-made-inn-service/constant"
	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
	"home-made-inn-service/util"
)

func (s *Server) findOrders(c *gin.Context) {
	var req query.OrderParams
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}
	// Select by store or user id
	if req.QueryByStoreOnly && req.StoreId > 0 {
		req.UserId = ""
	}

	Orders, err := s.dbStore.FindOrders(req)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, Orders)
}

func (s *Server) findOrderById(c *gin.Context) {

	if len(c.Param("id")) > 7 {
		id := c.Param("id")
		preloads := c.QueryArray("preloads")

		Order, err := s.dbStore.FindOrderById(query.OrderParams{
			Id:       id,
			Preloads: preloads,
		})

		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, Order)
		return

	} else {
		storeId := util.ParseInt(c.Param("id"))
		preloads := c.QueryArray("preloads")

		Order, err := s.dbStore.FindOrdersByStoreId(query.OrderParams{
			StoreId:  storeId,
			Preloads: preloads,
		})

		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, Order)
		return
	}
}

func (s *Server) getProfitSummary(c *gin.Context) {
	storeId := util.ParseInt(c.Query("storeId"))
	typeProfit := c.Query("typeProfit")
	timeProfit := c.Query("timeProfit")

	profitSummary, err := s.dbStore.GetProfitSummary(storeId, typeProfit, timeProfit)

	if err != nil {
		s.log.WithError(err).Error("error")
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, profitSummary)
}

func (s *Server) createOrder(c *gin.Context) {
	var requestOrder model.Order
	requestOrder.Id = uuid.NewV4().String()

	if err := c.BindJSON(&requestOrder); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	order, err := s.dbStore.CreateOrder(requestOrder)

	if err != nil {
		if err.Error() == constant.OutOfStock {
			c.Error(appError.NewBadRequestError().WithError(err))
			return
		}
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, order)
}

func (s *Server) updateOrder(c *gin.Context) {
	var requestOrder model.Order
	if err := c.BindJSON(&requestOrder); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestOrder.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	Order, err := s.dbStore.UpdateOrder(requestOrder)

	if requestOrder.Rating != nil && *requestOrder.Rating > 0 {
		orders, err := s.dbStore.FindOrdersByStoreId(query.OrderParams{
			StoreId:  requestOrder.StoreId,
			Preloads: c.QueryArray("preloads"),
		})
		if err != nil {
			return
		}
		if Order != nil {
			ratings := []float64{}
			for _, v := range orders {
				if v.Rating != nil {
					ratings = append(ratings, *v.Rating)
				}
			}
			aveScore := util.Average(ratings)

			s.dbStore.UpdateStore(model.Store{
				Id:          requestOrder.StoreId,
				RatingScore: &aveScore,
			})
		}
	}

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, Order)
}

func (s *Server) deleteOrder(c *gin.Context) {
	err := s.dbStore.DeleteOrder(c.Param("id"))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
