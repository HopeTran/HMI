package utils

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
