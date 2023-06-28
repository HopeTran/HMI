import { Controller, FieldValues, FieldErrors, UseControllerProps } from 'react-hook-form';
import classNames from 'classnames';
import { MultiSelect } from 'primereact/multiselect';

interface FormFieldProps extends UseControllerProps {
  label: string;
  errors: FieldErrors<FieldValues>;
  dataOptions?: any;
}

export default function FormFieldMultiSelect({ label, name, control, rules, errors, dataOptions }: FormFieldProps) {
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
              <MultiSelect
                id={field.name}
                optionLabel="label"
                value={field.value}
                options={dataOptions}
                appendTo={document.body}
                onChange={(e) => field.onChange(e.value)}
                className={classNames({ 'p-invalid': fieldState.invalid },'tw-flex-1')}
                filter
              />
            </div>
          )}
        />
        {errors[name] && <span className="p-error tw-mb-4">{errors[name].message}</span>}
      </div>
    </div>
  );
}
