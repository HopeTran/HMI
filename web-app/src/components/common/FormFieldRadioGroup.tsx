import { Controller, FieldValues, FieldErrors, UseControllerProps } from 'react-hook-form';
import classNames from 'classnames';

interface FormFieldProps extends UseControllerProps {
  label: string;
  errors: FieldErrors<FieldValues>;
  values: any[];
  disabled?: boolean;
}

export default function FormFieldRadioGroup({ label, name, control, rules, errors, values, disabled }: FormFieldProps) {
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
              {values.map((item) => (
                <div className="tw-pr-8">
                  <label className="tw-capitalize" htmlFor={item.value} key={`label-${item.value}`}>
                    {item.label}
                  </label>
                  <input
                    key={`value-${item.value}`}
                    id={item.value}
                    name={name}
                    value={item.value}
                    checked={field.value === item.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    disabled={disabled}
                    className={`tw-flex tw-px-2 tw-cursor-pointer ${classNames({
                      'p-invalid': fieldState.invalid,
                    })}`}
                    type="radio"
                  />
                </div>
              ))}
            </div>
          )}
        />
        {errors[name] && <span className="p-error tw-mb-4">{errors[name].message}</span>}
      </div>
    </div>
  );
}
