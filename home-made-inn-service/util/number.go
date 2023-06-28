package util

import (
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
)

func String2Int(str string) int {
	result, err := strconv.ParseInt(str, 10, 64)
	if err != nil {
		// log.Println("String2Int ", err)
		return 0
	}
	return int(result)
}

func String2Int64(str string) int64 {
	result, err := strconv.ParseInt(str, 10, 64)
	if err != nil {
		// log.Println("String2Int64 ", err)
		return 0
	}
	return result
}

func String2Float64(str string) float64 {
	result, err := strconv.ParseFloat(str, 64)
	if err != nil {
		// log.Println("String2Float64 ", err)
		return 0
	}
	return result
}

func RoundWithDecimal(number float64, dec int) float64 {
	return math.Round(number*math.Pow10(dec)) / math.Pow10(dec)
}

func FloorWithDecimal(number float64, dec int) float64 {
	return math.Floor(number*math.Pow10(dec)) / math.Pow10(dec)
}

func CountDecimal(number string) int {
	if strings.Contains(number, ".") {
		numbers := strings.Split(number, ".")
		return len(numbers[1])
	}
	return 0
}

func CountDecimalFloat(number float64) int {
	return CountDecimal(fmt.Sprintf("%f", number))
}

func Hex2Int64(hexStr string) int64 {
	// remove 0x suffix if found in the input string
	cleaned := strings.Replace(hexStr, "0x", "", -1)

	// base 16 for hexadecimal
	result, _ := strconv.ParseInt(cleaned, 16, 64)
	return result
}

func Hex2BigInt(hexStr string) *big.Int {
	cleaned := strings.Replace(hexStr, "0x", "", -1)
	result := new(big.Int)
	result.SetString(cleaned, 16)
	return result
}

func Int642Hex(value int64) string {
	return fmt.Sprintf("0x%x", value)
}

func Int642Hex64Chars(value int64) string {
	return fmt.Sprintf("0x%064x", value)
}

func GetHourFromStringTime(s string) int64 {
	r := strings.Split(s, ":")
	i, err := strconv.ParseInt(r[0], 10, 0)
	if err != nil {
		fmt.Println(err)
	}
	return i
}

func Average(xs []float64) float64 {
	total := 0.0
	for _, v := range xs {
		total += v
	}
	return total / float64(len(xs))
}
