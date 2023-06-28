package util

import (
	"fmt"
	"home-made-inn-service/constant"
	"reflect"
	"strings"

	"github.com/go-playground/validator"
)

var validate *validator.Validate

func ValidateStruct(model interface{}) string {
	if validate == nil {
		validate = validator.New()
		validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
			name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
			if name == "-" {
				return ""
			}
			return name
		})
	}

	errs := validate.Struct(model)

	if errs == nil {
		return ""
	}

	validationErrors := errs.(validator.ValidationErrors)
	if len(validationErrors) > 0 {
		errFieldName := validationErrors[0].Field()
		return fmt.Sprintf(constant.InvalidFormat, errFieldName)
	}

	return ""
}

func ValidateVar(fieldName string, value interface{}, validation string) string {
	validateVar := validator.New()
	errs := validateVar.Var(value, validation)

	if errs == nil {
		return ""
	}

	validationErrors := errs.(validator.ValidationErrors)
	if len(validationErrors) > 0 {
		return fmt.Sprintf(constant.InvalidFormat, fieldName)
	}

	return ""
}
