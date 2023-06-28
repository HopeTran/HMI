import { FieldProps } from 'formik';
import { Calendar } from 'primereact/calendar';
import React, { useEffect, useState } from 'react';

interface Props extends FieldProps {
  className?: string;
  onChangeCallback?: (setFieldValue: (field: string, value: any) => void, values: any) => void;
}

export default function CalendarField({ field, form: { touched, errors, setFieldValue, values }, ...props }: Props) {
  const [selectedValue, setSelectedValue] = useState<any>(null);

  const handleOnChange = (e: any) => {
    setFieldValue(field.name, e.value);
    if (props.onChangeCallback) {
      values[field.name] = e.value;
      props.onChangeCallback(setFieldValue, values);
    }
  };

  useEffect(() => {
    if (field.value) {
      setSelectedValue(new Date(field.value));
    }
  }, [field.value]);

  return (
      <div className={`form-control calendar-field ${props.className || ''}`}>
        <Calendar className="tw-w-full" value={selectedValue} onChange={handleOnChange} {...props} />
        {touched[field.name] && errors[field.name] && <div className="input-feedback">{errors[field.name]}</div>}
      </div>
  );
}
