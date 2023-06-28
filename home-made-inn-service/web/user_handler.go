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

type UserFavoriteStoreParams struct {
	StoreId int  `json:"storeId"`
	IsAdd   bool `json:"isAdd"`
}

func (s *Server) findUserById(c *gin.Context) {
	id := c.Param("id")

	var reqQuery query.UserParams
	if err := c.ShouldBindQuery(&reqQuery); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	user, err := s.dbStore.FindUserById(id, reqQuery)
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) findUsers(c *gin.Context) {
	var req query.UserParams
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	if req.CountOnly {
		count, err := s.dbStore.CountUsers(query.UserParams{
			Ids: req.Ids,
		})
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	users, err := s.dbStore.FindUsers(req)
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, users)
}

func (s *Server) createUser(c *gin.Context) {
	var requestUser model.User
	if err := c.BindJSON(&requestUser); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestUser); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	user, err := s.dbStore.CreateUser(requestUser)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) updateUser(c *gin.Context) {
	var requestUser model.User
	if err := c.BindJSON(&requestUser); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestUser.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	user, err := s.dbStore.UpdateUser(requestUser)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) updateUserFavoriteStore(c *gin.Context) {
	userId := c.Params.ByName("id")

	var req UserFavoriteStoreParams
	if err := c.BindJSON(&req); err != nil {
		c.Error(appError.NewBadRequestError().WithMessage("Invalid request"))
		return
	}
	var err error
	if req.IsAdd {
		err = s.dbStore.AddFavoriteStore(userId, req.StoreId)
	} else {
		err = s.dbStore.RemoveFavoriteStore(userId, req.StoreId)
	}

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, "ok")
}

func (s *Server) deleteUser(c *gin.Context) {
	err := s.dbStore.DeleteUser(c.Param("id"))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
