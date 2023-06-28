package util

func ParseNullableBool(value string) *bool {
	var result *bool
	if value == "true" {
		true := true
		result = &true
	} else if value == "false" {
		false := false
		result = &false
	}

	return result
}

func ParseBool(value string) bool {
	if value == "true" {
		return true
	}

	return false
}

func ParseNullableInt(value string) *int {
	var result *int
	if value == "" {
		result = nil
	} else {
		int := String2Int(value)
		result = &int
	}

	return result
}

func ParseInt(value string) int {
	int := String2Int(value)
	return int
}

func ParseIntArray(strIds []string) []int {
	var intIds []int
	for _, id := range strIds {
		intIds = append(intIds, ParseInt(id))
	}
	return intIds
}

func ParseFloat(value string) float64 {
	return String2Float64(value)
}

func ParseFloat64Array(strValues []string) []float64 {
	var floatValues []float64
	for _, id := range strValues {
		floatValues = append(floatValues, String2Float64(id))
	}
	return floatValues
}
