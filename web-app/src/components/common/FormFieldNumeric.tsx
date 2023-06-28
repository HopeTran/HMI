import { Controller, FieldValues, FieldErrors, UseControllerProps } from 'react-hook-form';
import classNames from 'classnames';

import { PERCENTAGE_TYPE } from 'constants/constant';
import NumericInput from './NumericInput';

interface FormFieldNumericProps extends UseControllerProps {
  label: string;
  decimal: number;
  errors: FieldErrors<FieldValues>;
  type?: string;
}

export default function FormFieldNumeric({
  label,
  decimal,
  name,
  control,
  rules,
  errors,
  type,
}: FormFieldNumericProps) {
  return (
    <div className="form-field tw-flex tw-justify-between">
      <label htmlFor={name} className="tw-mr-4 tw-capitalize">
        {label}
      </label>
      <div className="tw-flex tw-flex-col">
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }: any) => (
            <div className="tw-flex tw-items-center div-input">
              <NumericInput
                className={`p-inputtext tw-flex tw-px-2 ${classNames({
                  'p-invalid': fieldState.invalid,
                  'tw-flex-1': type === PERCENTAGE_TYPE,
                })}`}
                value={field.value}
                decimalScale={decimal}
                onValueChange={(e: any) => field.onChange(e.floatValue)}
              />
            </div>
          )}
        />
        {errors[name] && <span className="p-error tw-mb-4">{errors[name].message}</span>}
      </div>
    </div>
  );
}
