package web

import (
	"net/http"

	appError "github.com/NarrowPacific/common-go/app-error"
	"github.com/gin-gonic/gin"

	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
	"home-made-inn-service/util"
)

func (s *Server) findAttributeValueById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))

	attributeValue, err := s.dbStore.FindAttributeValueById(query.AttributeValueParams{
		Id: id,
	})

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, attributeValue)
	return
}

func (s *Server) findAttributeValues(c *gin.Context) {

	attributeId := util.ParseInt(c.Param("attrId"))
	name := c.Query("name")
	ids := util.ParseIntArray(c.QueryArray("ids"))
	offset := util.ParseNullableInt(c.Query("offset"))
	limit := util.ParseNullableInt(c.Query("limit"))
	countOnly := util.ParseBool(c.Query("countOnly"))

	if countOnly {
		count, err := s.dbStore.CountAttributeValues(query.AttributeValueParams{
			Ids:  ids,
			Name: name,
		})
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	attributeValues, err := s.dbStore.FindAttributeValues(query.AttributeValueParams{
		AttributeId: attributeId,
		Ids:         ids,
		Name:        name,
		Offset:      offset,
		Limit:       limit,
	})

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, attributeValues)
	return
}

func (s *Server) createAttributeValue(c *gin.Context) {

	var requestAttributeValues []model.AttributeValue

	if err := c.BindJSON(&requestAttributeValues); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	for _, attrValue := range requestAttributeValues {
		attributeValue, err := s.dbStore.CreateAttributeValue(attrValue)
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, attributeValue)
	}

	return
}

func (s *Server) updateAttributeValue(c *gin.Context) {
	var requestAttributeValues []model.AttributeValue
	if err := c.BindJSON(&requestAttributeValues); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	for _, attrValue := range requestAttributeValues {
		if attrValue.Id > 0 {
			attributeValue, err := s.dbStore.UpdateAttributeValue(attrValue)
			if err != nil {
				c.Error(appError.NewServerError().WithError(err))
				return
			}
			c.JSON(http.StatusOK, attributeValue)
		} else {
			attributeValue, err := s.dbStore.CreateAttributeValue(attrValue)
			if err != nil {
				c.Error(appError.NewServerError().WithError(err))
				return
			}
			c.JSON(http.StatusOK, attributeValue)
		}
	}
	return
}

func (s *Server) deleteAttributeValue(c *gin.Context) {
	err := s.dbStore.DeleteAttributeValue(util.ParseInt(c.Param("vid")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
