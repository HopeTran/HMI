import { Dropdown } from 'primereact/dropdown';
import { Controller, FieldValues, FieldErrors, UseControllerProps } from 'react-hook-form';
import classNames from 'classnames';
interface FormFieldProps extends UseControllerProps {
  label?: string;
  errors: FieldErrors<FieldValues>;
  dataOptions?: any;
  placeholder?: string;
  classname?: string;  
}
export default function FormFieldDropdown({ label, name, control, rules, errors, dataOptions, placeholder, classname }: FormFieldProps) {
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
            <Dropdown
              id={field.name}
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={dataOptions}
              appendTo={document.body}
              optionLabel="label"
              className={classNames({ 'p-invalid': fieldState.invalid }, classname)}
              placeholder={placeholder}
            />
          )}
        />
        {errors[name] && <span className="p-error tw-mb-4">{errors[name].message}</span>}
      </div>
    </div>
  );
}