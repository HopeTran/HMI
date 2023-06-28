package util

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"golang.org/x/exp/slices"

	"home-made-inn-service/model"
)

func StringArrayContains(s []string, str string) bool {
	for _, v := range s {
		if strings.ToLower(v) == strings.ToLower(str) {
			return true
		}
	}

	return false
}

func SplitToChunks(slice interface{}, chunkSize int) (interface{}, error) {
	sliceType := reflect.TypeOf(slice)
	sliceVal := reflect.ValueOf(slice)
	length := sliceVal.Len()
	if sliceType.Kind() != reflect.Slice {
		return nil, errors.New("invalid slice")
	}
	n := 0
	if length%chunkSize > 0 {
		n = 1
	}
	chunks := reflect.MakeSlice(reflect.SliceOf(sliceType), 0, length/chunkSize+n)
	st, ed := 0, 0
	for st < length {
		ed = st + chunkSize
		if ed > length {
			ed = length
		}
		chunks = reflect.Append(chunks, sliceVal.Slice(st, ed))
		st = ed
	}
	return chunks.Interface(), nil
}

func ProfitDataMap(data []model.Profit, week string) (profitData []model.Profit) {
	days := []string{}
	now := time.Now()

	if week == "thisWeek" {
		now = now
	} else {
		now = now.AddDate(0, 0, -7)
	}

	for i := 0; i < 7; i++ {
		elapsed := now.AddDate(0, 0, -i).Format("2006-01-02")
		days = append(days, elapsed)
	}

	if data != nil {
		weekDayData := []model.Profit{}
		for _, x := range data {
			x.CreatedAt = fmt.Sprintf("%d-%02d-%02d", x.Year, x.Month, x.Week)
			x.WeekDay = fmt.Sprintf(time.Date(x.Year, time.Month(x.Month), x.Week, 20, 34, 58, 651387237, time.UTC).Weekday().String())
			var position = 0
			for n, e := range weekDayData {
				if e.CreatedAt == x.CreatedAt {
					position = n
				}
			}
			if position == 0 {
				weekDayData = append(weekDayData, x)
			} else {
				x.Profit = x.Profit + weekDayData[position].Profit
			}
		}

		if weekDayData != nil {
			for _, wd := range days {
				idx := slices.IndexFunc(weekDayData, func(c model.Profit) bool { return c.CreatedAt == fmt.Sprintf(wd) })
				layout := "2006-01-02"
				str := wd
				t, err := time.Parse(layout, str)

				if err != nil {
					return
				}

				if idx > -1 {
					profitData = append(profitData, weekDayData[idx])
				} else {
					order := model.Profit{}
					order.CreatedAt = wd
					order.WeekDay = fmt.Sprintf(t.Weekday().String())
					order.Profit = 0
					profitData = append(profitData, order)
				}

			}
		}
	}
	return profitData
}
