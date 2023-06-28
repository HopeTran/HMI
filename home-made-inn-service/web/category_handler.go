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

func (s *Server) findCategoryById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))
	preloads := c.QueryArray("preloads")

	category, err := s.dbStore.FindCategoryById(query.CategoryParams{
		Id:       id,
		Preloads: preloads,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, category)
	return
}

func (s *Server) findCategories(c *gin.Context) {
	name := c.Query("name")
	ids := util.ParseIntArray(c.QueryArray("ids"))
	storeId := util.ParseInt(c.Query("storeId"))
	offset := util.ParseNullableInt(c.Query("offset"))
	limit := util.ParseNullableInt(c.Query("limit"))
	countOnly := util.ParseBool(c.Query("countOnly"))
	preloads := c.QueryArray("preloads")

	if countOnly {
		count, err := s.dbStore.CountCategories(query.CategoryParams{
			Ids:     ids,
			Name:    name,
			StoreId: storeId,
		})
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	categories, err := s.dbStore.FindCategories(query.CategoryParams{
		Ids:      ids,
		Name:     name,
		StoreId:  storeId,
		Offset:   offset,
		Limit:    limit,
		Preloads: preloads,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, categories)
	return
}

func (s *Server) createCategory(c *gin.Context) {
	var requestCategory model.Category
	if err := c.BindJSON(&requestCategory); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestCategory); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	category, err := s.dbStore.CreateCategory(requestCategory)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, category)
	return
}

func (s *Server) updateCategory(c *gin.Context) {
	var requestCategory model.Category
	if err := c.BindJSON(&requestCategory); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestCategory.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	category, err := s.dbStore.UpdateCategory(requestCategory)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, category)
	return
}

func (s *Server) deleteCategory(c *gin.Context) {
	err := s.dbStore.DeleteCategory(util.ParseInt(c.Param("id")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
