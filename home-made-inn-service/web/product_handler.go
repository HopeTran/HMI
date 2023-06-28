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

func (s *Server) findProductById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))
	preloads := c.QueryArray("preloads")

	product, err := s.dbStore.FindProductById(query.ProductParams{
		Id:       id,
		Preloads: preloads,
	})
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, product)
	return
}

func (s *Server) findProducts(c *gin.Context) {
	name := c.Query("name")
	ids := util.ParseIntArray(c.QueryArray("ids"))
	storeId := util.ParseInt(c.Query("storeId"))
	offset := util.ParseNullableInt(c.Query("offset"))
	limit := util.ParseNullableInt(c.Query("limit"))
	countOnly := util.ParseBool(c.Query("countOnly"))
	preloads := c.QueryArray("preloads")

	if countOnly {
		count, err := s.dbStore.CountProducts(query.ProductParams{
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

	products, err := s.dbStore.FindProducts(query.ProductParams{
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
	c.JSON(http.StatusOK, products)
	return
}

func (s *Server) createProduct(c *gin.Context) {
	var requestProduct model.Product
	if err := c.BindJSON(&requestProduct); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestProduct); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	product, err := s.dbStore.CreateProduct(requestProduct)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, product)
	return
}

func (s *Server) updateProduct(c *gin.Context) {
	var requestProduct model.Product
	if err := c.BindJSON(&requestProduct); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestProduct.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	product, err := s.dbStore.UpdateProduct(requestProduct)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, product)
	return
}

func (s *Server) deleteProduct(c *gin.Context) {
	err := s.dbStore.DeleteProduct(util.ParseInt(c.Param("id")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
