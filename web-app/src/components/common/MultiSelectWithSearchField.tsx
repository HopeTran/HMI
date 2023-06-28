import React, { useEffect, useState } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { FieldProps } from 'formik';

interface Props extends FieldProps {
  className: string;
  style: any;
  options: any[];
  placeholder?: string;
  optionLabel?: string;
  onChangeValue?: (values: any) => void;
}

export default function MultiSelectWithSearchField({
  field,
  form: { touched, errors, setFieldValue},
  ...props
}: Props) {
  const [selectedValue, setSelectedValue] = useState(null);

  const valueTemplate = (option: any) => {
    return (
      <div className="">
        <div>{option.name}</div>
      </div>
    );
  };

  const selectedValueTemplate = (option: any) => {
    if (option) {
      return (
        <div className="item-value">
          <div>{option.name}</div>
        </div>
      );
    }
    return '';
  };

  const handleOnChange = (e: any) => {
    setFieldValue(field.name, e.value);
  };

  useEffect(() => {
    if (props.onChangeValue) {
      props.onChangeValue(selectedValue);
    }
  }, [selectedValue]);

  useEffect(() => {
    const values: any = props.options?.filter((item: any) => {
      const found = field.value?.find((val: any) => val.id === item.id);
      return found;
    });
    setSelectedValue(values);
  }, [field.value, props.options]);

  return (
    <div className="multiselect-demo col-12">
      <MultiSelect
        value={selectedValue}
        onChange={handleOnChange}
        filter
        itemTemplate={valueTemplate}
        selectedItemTemplate={selectedValueTemplate}
        {...props}
      />
      {touched[field.name] && errors[field.name] && <div className="input-feedback">{errors[field.name]}</div>}
    </div>
  );
}
