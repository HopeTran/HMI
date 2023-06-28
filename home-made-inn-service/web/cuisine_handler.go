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

func (s *Server) findCuisineById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))

	cuisine, err := s.dbStore.FindCuisineById(query.CuisineParams{
		Id: id,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, cuisine)
	return
}

func (s *Server) findCuisines(c *gin.Context) {
	ids := c.QueryArray("ids")
	offset := util.ParseNullableInt(c.Query("offset"))
	limit := util.ParseNullableInt(c.Query("limit"))
	countOnly := util.ParseBool(c.Query("countOnly"))

	if countOnly {
		count, err := s.dbStore.CountCuisines(query.CuisineParams{
			Ids: ids,
		})
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	cuisines, err := s.dbStore.FindCuisines(query.CuisineParams{
		Ids:    ids,
		Offset: offset,
		Limit:  limit,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, cuisines)
	return
}

func (s *Server) createCuisine(c *gin.Context) {
	var requestCuisine model.Cuisine
	if err := c.BindJSON(&requestCuisine); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestCuisine); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	cuisine, err := s.dbStore.CreateCuisine(requestCuisine)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, cuisine)
	return
}

func (s *Server) updateCuisine(c *gin.Context) {
	var requestCuisine model.Cuisine
	if err := c.BindJSON(&requestCuisine); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestCuisine.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	cuisine, err := s.dbStore.UpdateCuisine(requestCuisine)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, cuisine)
	return
}

func (s *Server) deleteCuisine(c *gin.Context) {
	err := s.dbStore.DeleteCuisine(util.ParseInt(c.Param("id")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
