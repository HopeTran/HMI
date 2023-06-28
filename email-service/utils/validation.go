package utils

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator"

	"github.com/NarrowPacific/email-service/constant"
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
