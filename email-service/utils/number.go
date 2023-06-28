package utils

import (
	"log"
	"strconv"
)

func String2Int(str string) int {
	if str != "" {
		result, err := strconv.ParseInt(str, 10, 64)
		if err != nil {
			log.Println("String2Int ", err)
		}
		return int(result)
	}
	return 0
}
