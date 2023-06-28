package web

import (
	"net/http"

	appError "github.com/NarrowPacific/common-go/app-error"
	"github.com/gin-gonic/gin"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
	"home-made-inn-service/util"
)

func (s *Server) findProductAttributeById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))

	productAttribute, err := s.dbStore.FindProductAttributeById(query.ProductAttributeParams{
		Id: id,
	})

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, productAttribute)
	return
}

func (s *Server) findProductAttributes(c *gin.Context) {

	attributeId := util.ParseInt(c.Param("attrId"))
	ids := util.ParseIntArray(c.QueryArray("ids"))
	offset := util.ParseNullableInt(c.Query("offset"))
	limit := util.ParseNullableInt(c.Query("limit"))
	countOnly := util.ParseBool(c.Query("countOnly"))

	if countOnly {
		count, err := s.dbStore.CountProductAttributes(query.ProductAttributeParams{
			Ids: ids,
		})
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	productAttributes, err := s.dbStore.FindProductAttributes(query.ProductAttributeParams{
		AttributeId: attributeId,
		Ids:         ids,
		Offset:      offset,
		Limit:       limit,
	})

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, productAttributes)
	return
}

func (s *Server) createProductAttribute(c *gin.Context) {

	var requestProductAttributes []model.ProductAttribute

	if err := c.BindJSON(&requestProductAttributes); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	for _, attrValue := range requestProductAttributes {
		productAttribute, err := s.dbStore.CreateProductAttribute(attrValue)
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, productAttribute)
	}

	return
}

func (s *Server) updateProductAttribute(c *gin.Context) {
	var requestProductAttributes []model.ProductAttribute
	if err := c.BindJSON(&requestProductAttributes); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	for _, attrValue := range requestProductAttributes {
		if attrValue.Id > 0 {
			productAttribute, err := s.dbStore.UpdateProductAttribute(attrValue)
			if err != nil {
				c.Error(appError.NewServerError().WithError(err))
				return
			}
			c.JSON(http.StatusOK, productAttribute)
		} else {
			productAttribute, err := s.dbStore.CreateProductAttribute(attrValue)
			if err != nil {
				c.Error(appError.NewServerError().WithError(err))
				return
			}
			c.JSON(http.StatusOK, productAttribute)
		}
	}
	return
}

func (s *Server) deleteProductAttribute(c *gin.Context) {
	err := s.dbStore.DeleteProductAttribute(util.ParseInt(c.Param("id")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
