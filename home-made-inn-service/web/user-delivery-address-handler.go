package web

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"home-made-inn-service/model"

	appError "github.com/NarrowPacific/common-go/app-error"
)

func (s *Server) createUserDeliveryAddress(c *gin.Context) {
	var addressInfo model.UserDeliveryAddress

	if err := c.BindJSON(&addressInfo); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	addressInfo.UserId = c.Param("id")

	if err := s.dbStore.CreateUserDeliveryAddress(addressInfo); err != nil {
		c.Error(appError.NewAppError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, "ok")
}

func (s *Server) updateUserDeliveryAddress(c *gin.Context) {
	var addressInfo model.UserDeliveryAddress

	if err := c.BindJSON(&addressInfo); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	addressInfo.UserId = c.Param("id")

	if err := s.dbStore.UpdateUserDeliveryAddress(addressInfo); err != nil {
		c.Error(appError.NewAppError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, "ok")
}

func (s *Server) deleteUserDeliveryAddress(c *gin.Context) {
	addressID, err := strconv.ParseUint(c.Param("aID"), 10, 64)
	if err != nil {
		c.Error(appError.NewBadRequestError().WithMessage("id should be unsigned integer"))
		return
	}

	if err := s.dbStore.DeleteUserDeliveryAddress(addressID); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, "ok")
}

func (s *Server) getAllUserDeliveryAddresses(c *gin.Context) {
	userId := c.Param("id")

	addresses, err := s.dbStore.FindAllUserDeliveryAddresses(userId)

	if err != nil {
		c.Error(appError.NewAppError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, &addresses)
}
