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

func (s *Server) findPlatformCategoryById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))

	platformCategory, err := s.dbStore.FindPlatformCategoryById(query.PlatformCategoryParams{
		Id: id,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, platformCategory)
	return
}

func (s *Server) findPlatformCategories(c *gin.Context) {
	var req query.PlatformCategoryParams
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	if req.CountOnly {
		count, err := s.dbStore.CountPlatformCategories(req)
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	platformCategories, err := s.dbStore.FindPlatformCategories(req)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, platformCategories)
	return
}

func (s *Server) createPlatformCategory(c *gin.Context) {
	var requestPlatformCategory model.PlatformCategory
	if err := c.BindJSON(&requestPlatformCategory); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestPlatformCategory); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	platformCategory, err := s.dbStore.CreatePlatformCategory(requestPlatformCategory)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, platformCategory)
	return
}

func (s *Server) updatePlatformCategory(c *gin.Context) {
	var requestPlatformCategory model.PlatformCategory
	if err := c.BindJSON(&requestPlatformCategory); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestPlatformCategory.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	platformCategory, err := s.dbStore.UpdatePlatformCategory(requestPlatformCategory)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, platformCategory)
	return
}

func (s *Server) deletePlatformCategory(c *gin.Context) {
	err := s.dbStore.DeletePlatformCategory(util.ParseInt(c.Param("id")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
