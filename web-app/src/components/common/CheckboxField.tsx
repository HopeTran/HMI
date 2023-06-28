import { FieldProps } from 'formik';
import { Checkbox } from 'primereact/checkbox';
import React from 'react';

interface Props extends FieldProps {
  value: any;
  onChange?: (e: any) => void;
}

export default function CheckboxField({
  field,
  form: { touched, errors, setFieldValue },
  ...props
}: Props) {
  const handleChange = (e: any) => {
    setFieldValue(field.name, e.checked);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <Checkbox
      {...props}
      name={field.name}
      onChange={handleChange}
      checked={props.value || field.value}
    />
  );
}
