import { FieldProps } from 'formik';
import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useState } from 'react';

import countriesList from 'statics/countries.json';

interface Props extends FieldProps {
  className: string;
  style: any;
  value: any;
  placeholder: string;
  options: any[];
  icon: any;
}

export const isRestricted = (restrictedCountries: any[], country: string) => {
  return restrictedCountries && restrictedCountries.indexOf(country) > -1;
};

export default function CountryDropdown({ field, form: { touched, errors, setFieldValue }, icon, ...props }: Props) {
  const [selectedCountry, setSelectedCountry] = useState(props.value || '');

    const handleOnChange = (e: any) => {
    setSelectedCountry(e.value);
  };

  useEffect(() => {
    setFieldValue(field.name, selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    if (props.value) {
      setSelectedCountry(props.value);
    }
  }, [props.value]);

  return (
    <>
      <div className={`form-control country-dropdown ${props.className || ''}`}>
        <div className="input-group w-100">
          {icon && <img className="start-icon" src={icon} />}
          <Dropdown
            value={selectedCountry}
            options={countriesList}
            optionLabel={'name'}
            optionValue={'code'}
            onChange={handleOnChange}
            style={props.style}
            placeholder={props.placeholder || 'Country'}
          />
          {touched[field.name] && errors[field.name] && <div className="input-feedback">{errors[field.name]}</div>}
        </div>
      </div>
  
    </>
  );
}
