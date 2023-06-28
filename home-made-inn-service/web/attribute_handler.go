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

func (s *Server) findAttributeById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))

	Attribute, err := s.dbStore.FindAttributeById(query.AttributeParams{
		Id: id,
	})

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, Attribute)
	return
}

func (s *Server) findAttributes(c *gin.Context) {
	name := c.Query("name")
	offset := util.ParseNullableInt(c.Query("offset"))
	limit := util.ParseNullableInt(c.Query("limit"))
	countOnly := util.ParseBool(c.Query("countOnly"))

	if countOnly {
		count, err := s.dbStore.CountAttributes(query.AttributeParams{
			Name: name,
		})
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	Attributes, err := s.dbStore.FindAttributes(query.AttributeParams{
		Name:   name,
		Offset: offset,
		Limit:  limit,
	})

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}
	c.JSON(http.StatusOK, Attributes)
	return
}

func (s *Server) createAttribute(c *gin.Context) {
	var requestAttribute model.Attribute

	if err := c.BindJSON(&requestAttribute); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestAttribute); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	attribute, err := s.dbStore.CreateAttribute(requestAttribute)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, attribute)

	for _, attrValue := range requestAttribute.AttributeValues {
		attrValue.AttributeId = attribute.Id
		attributeValue, err := s.dbStore.CreateAttributeValue(attrValue)
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, attributeValue)
	}
	return
}

func (s *Server) updateAttribute(c *gin.Context) {
	var requestAttribute model.Attribute
	if err := c.BindJSON(&requestAttribute); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestAttribute.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	Attribute, err := s.dbStore.UpdateAttribute(requestAttribute)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, Attribute)
	return
}

func (s *Server) deleteAttribute(c *gin.Context) {
	err := s.dbStore.DeleteAttribute(util.ParseInt(c.Param("id")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
	return
}
