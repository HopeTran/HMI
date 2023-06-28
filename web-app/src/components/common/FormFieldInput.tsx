import { Controller, FieldValues, FieldErrors, UseControllerProps } from 'react-hook-form';
import classNames from 'classnames';
import { PERCENTAGE_TYPE } from 'constants/constant';
interface FormFieldProps extends UseControllerProps {
  label?: string;
  errors: FieldErrors<FieldValues>;
  type?: string;
  placeholder?: string;
  classname?: string
}
export default function FormFieldInput({ label, name, control, rules, errors, type, placeholder, classname }: FormFieldProps) {
  return (
    <div className="form-field tw-flex tw-justify-between">
      {label &&
        <label htmlFor={name} className="tw-mr-4 tw-capitalize">
          {label}
        </label>
      }
      <div className="tw-flex tw-flex-col">
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field, fieldState }: any) => (
            <div className="tw-flex tw-items-center div-input">
              <input
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className={`tw-flex tw-px-2 ${classNames({
                  'p-invalid': fieldState.invalid,
                  'tw-flex-1': type === PERCENTAGE_TYPE,
                })} ${classname}`}
                type={type === PERCENTAGE_TYPE ? 'number' : type}
                placeholder={placeholder}
              />
              {type === PERCENTAGE_TYPE && <span className="tw-flex tw-text-xl tw-ml-2">%</span>}
            </div>
          )}
        />
        {errors[name] && <span className="p-error tw-mb-4">{errors[name].message}</span>}
      </div>
    </div>
  );
}
