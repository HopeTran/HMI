import * as Yup from 'yup';
import uniq from 'lodash/uniq';

export { createYupSchema, addPasswordSchema, getPasswordValidationMessage, getPasswordValidationWithIndicators };

const createYupSchema = (schema: any, config: any) => {
  const { field, type, validations = [] } = config;
  if (!(Yup as any)[type]) {
    return schema;
  }

  let validator = (Yup as any)[type]();
  validations.forEach((validation: any) => {
    const { params, type } = validation;
    if (!validator[type]) {
      return;
    }
    validator = validator[type](...params);
  });
  schema[field] = validator;
  return schema;
};

const getPasswordValidationMessage = (validtor: any) => {
  if (validtor.validator === 'length') {
    return `Password must contain at least ${validtor.value} characters`;
  } else {
    return `Password must contain ${validtor.value} ${validtor.validator.replace('_', ' ')}`;
  }
};

const getPasswordValidationWithIndicators = async (passwordSchema: any, password: string) => {
  let validationMessage = '';
  if (passwordSchema) {
    let messages: string[] = [];
    let errors: string[] = [];

    // Get all validation messages
    passwordSchema.tests.forEach((test: any) => {
      messages.push(test.OPTIONS.message);
    });

    messages = uniq(messages);

    try {
      await passwordSchema.validate(password, { sync: true, abortEarly: false });
    } catch (e: any) {
      if (e.errors) {
        // Validate password then get errors message if any
        errors = e.errors;
        // Build validation messages with indicator
        messages.forEach((message: any) => {
          const indicatorClass = errors.includes(message) ? 'pi-times negative' : 'pi-check positive';
          validationMessage += `<div class="message"><i class="pi ${indicatorClass}"></i> <span>${message}</span></div>`;
        });
      }
    }
  }

  return validationMessage;
};

const addPasswordSchema = (rootValidators: any, validators: any) => {
  const passwordSchema = {
    field: 'password',
    type: 'string',
    validations: [
      {
        type: 'required',
        params: ['Password is required'],
      },
    ],
  };

  if (validators && validators.length > 0) {
    validators.forEach((item: any) => {
      if (item.enable) {
        if (item.validator === 'length') {
          passwordSchema.validations.push({
            type: 'min',
            params: [item.value, getPasswordValidationMessage(item)],
          });
        } else {
          passwordSchema.validations.push({
            type: item.validator,
            params: [item.value, getPasswordValidationMessage(item)],
          });
        }
      }
    });
  }
  rootValidators.push(passwordSchema);
  const yepSchema = rootValidators.reduce(createYupSchema, {});
  const validateSchema = Yup.object().shape(yepSchema);
  return validateSchema;
};
