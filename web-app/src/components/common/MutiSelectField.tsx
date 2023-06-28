import { FieldProps } from 'formik';
import { MultiSelect } from 'primereact/multiselect';
import React, { useEffect, useState } from 'react';

interface Props extends FieldProps {
  className: string;
  style: any;
  options: any[];
  placeholder?: string;
  optionLabel?: string;
}

// Wrap MultiSelect to Formik Field for data binding
export default function MultiSelectField({ field, form: { touched, errors, setFieldValue }, ...props }: Props) {
  const [selectedValue, setSelectedValue] = useState<any[]>([]);

  const handleOnChange = (e: any) => {
    setFieldValue(field.name, e.value);
  };

  useEffect(() => {
    const values = props.options?.filter((item: any) => {
      const found = field.value?.find((val: any) => val.id === item.id);
      return found;
    });
    setSelectedValue(values);
  }, [field.value, props.options]);

  return (
    <div className="form-control multiselect-field">
      <MultiSelect display="chip" value={selectedValue} onChange={handleOnChange} {...props} />
      {touched[field.name] && errors[field.name] && <div className="input-feedback">{errors[field.name]}</div>}
    </div>
  );
}
