package web

import (
	"net/http"

	appError "github.com/NarrowPacific/common-go/app-error"
	"github.com/gin-gonic/gin"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
	"home-made-inn-service/util"
)

func (s *Server) findCartItems(c *gin.Context) {
	userId := c.Query("userId")
	productId := util.ParseInt(c.Query("productId"))
	quantity := util.ParseInt(c.Query("quantity"))
	preloads := c.QueryArray("preloads")

	CartItems, err := s.dbStore.FindCartItems(query.CartParams{
		UserId:    userId,
		ProductId: productId,
		Quantity:  quantity,
		Preloads:  preloads,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, CartItems)
	return
}

func (s *Server) createCartItem(c *gin.Context) {
	var requestCartItem model.CartItem
	if err := c.BindJSON(&requestCartItem); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	if errMsg := util.ValidateStruct(requestCartItem); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	Cart, err := s.dbStore.CreateCartItem(requestCartItem)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, Cart)
	return
}

func (s *Server) updateCartItem(c *gin.Context) {
	var requestCartItem model.CartItem
	if err := c.BindJSON(&requestCartItem); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	Cart, err := s.dbStore.UpdateCartItems(requestCartItem)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, Cart)
	return
}

func (s *Server) deleteCartItem(c *gin.Context) {
	err := s.dbStore.DeleteCartItem(c.Param("userId"), util.ParseInt(c.Param("productId")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
