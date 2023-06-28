package web

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	appError "github.com/NarrowPacific/common-go/app-error"
	"github.com/gin-gonic/gin"

	"home-made-inn-service/constant"
	"home-made-inn-service/model"
	"home-made-inn-service/store/query"
	"home-made-inn-service/util"
)

func (s *Server) findStoreById(c *gin.Context) {
	id := util.ParseInt(c.Param("id"))
	var req query.StoreParams

	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	req.Id = id
	store, err := s.dbStore.FindStoreById(req)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, store)
}

func (s *Server) findStores(c *gin.Context) {
	var req query.StoreParams
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	if req.CountOnly {
		count, err := s.dbStore.CountStores(req)
		if err != nil {
			c.Error(appError.NewServerError().WithError(err))
			return
		}
		c.JSON(http.StatusOK, count)
		return
	}

	stores, err := s.dbStore.FindStores(req)
	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, stores)
}

func (s *Server) createStore(c *gin.Context) {
	var requestStore model.Store
	if err := c.BindJSON(&requestStore); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateStruct(requestStore); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}

	if err := validateOperatingTimes(requestStore.OperationTimes); err != nil {
		c.Error(appError.NewBadRequestError().WithError(err))
		return
	}

	store, err := s.dbStore.CreateStore(requestStore)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, store)
}

func (s *Server) updateStore(c *gin.Context) {
	var requestStore model.Store
	if err := c.BindJSON(&requestStore); err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	if errMsg := util.ValidateVar("id", requestStore.Id, constant.Required); errMsg != "" {
		c.Error(appError.NewBadRequestError().WithMessage(errMsg))
		return
	}
	// if err := validateOperatingTimes(requestStore.OperationTimes); err != nil {
	// 	c.Error(appError.NewBadRequestError().WithError(err))
	// 	return
	// }
	store, err := s.dbStore.UpdateStore(requestStore)

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, store)
}

func (s *Server) deleteStore(c *gin.Context) {
	err := s.dbStore.DeleteStore(util.ParseInt(c.Param("id")))

	if err != nil {
		c.Error(appError.NewServerError().WithError(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func getDurationTimeNumber(duration string) float64 {
	d := strings.Split(duration, ":")
	seconds, err := strconv.ParseFloat(d[2], 64)
	if err != nil {
		return 0
	}
	minutes, err := strconv.ParseFloat(d[1], 64)
	if err != nil {
		return 0
	}
	hours, err := strconv.ParseFloat(d[0], 64)
	if err != nil {
		return 0
	}
	return seconds + minutes*60 + hours*60*60
}

func isValidTimeRanges(from1, to1, from2, to2 string) bool {
	fromNum1 := getDurationTimeNumber(from1)
	fromNum2 := getDurationTimeNumber(from2)
	toNum1 := getDurationTimeNumber(to1)
	toNum2 := getDurationTimeNumber(to2)
	return fromNum1 < toNum1 && toNum1 <= fromNum2 && fromNum2 < toNum2 || fromNum1 < toNum1 && fromNum1 >= toNum2 && fromNum2 < toNum2
}

func validateOperatingTimes(operatingTimes []model.OperationTime) error {
	if len(operatingTimes) > 1 {
		for i := range operatingTimes {
			for j := range operatingTimes {
				if operatingTimes[i].WeekDay == operatingTimes[j].WeekDay && i != j {
					from1 := fmt.Sprint(operatingTimes[i].AvailableFrom)
					to1 := fmt.Sprint(operatingTimes[i].AvailableTo)
					from2 := fmt.Sprint(operatingTimes[j].AvailableFrom)
					to2 := fmt.Sprint(operatingTimes[j].AvailableTo)
					if !isValidTimeRanges(from1, to1, from2, to2) {
						return errors.New("invalid_operating_times")
					}
				}
			}
		}
	}

	return nil
}
