package util

import (
	"time"
)

func GetMillisecondTimestamp(date time.Time) int64 {
	return int64(time.Nanosecond) * date.UnixNano() / int64(time.Millisecond)
}

func MillisecondToTime(value int64) time.Time {
	return time.Unix(value/1000, 0)
}

func GetStartDateUTCTime(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
}

func GetEndDateUTCTime(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 0, 0, time.UTC)
}

func GetEndDateInSecondUTCTime(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 0, time.UTC)
}

func GetStartHourUTCTime(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), date.Hour(), 0, 0, 0, time.UTC)
}

func GetEndHourUTCTime(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), date.Hour(), 59, 0, 0, time.UTC)
}

func GetEndHourInSecondUTCTime(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), date.Hour(), 59, 59, 0, time.UTC)
}
