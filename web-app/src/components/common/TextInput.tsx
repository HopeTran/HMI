import { FieldProps } from 'formik';
import React, { useState, useRef } from 'react';
import { get } from 'lodash';
import { Button } from 'primereact/button';

import { OverlayPanel } from 'primereact/overlaypanel';
import { getNumberByStep, isNumber } from 'utilities/common';

import Eye from '../../statics/images/eye.svg';
import InfoCircle from '../../statics/images/info-circle.svg';

interface Props extends FieldProps {
  type: string;
  unit?: string;
  label?: string;
  setInputValue?: (t: number) => void;
  onBlur?: (event: any) => void;
  tooltip?: string;
  icon?: any;
  maxLength?: number;
  maxValue?: any;
  isInteger?: boolean;
  isRequired?: boolean;
  step?: any;
}

const EyeIcon = ({ onClick }: { onClick: () => void }) => {
  return <img className="icon eye-icon" src={Eye} onClick={onClick} />;
};

export const InfoCircleIcon = () => {
  return <img className="icon" src={InfoCircle} />;
};

function TextInput({
  field,
  form: { touched, errors, setFieldValue },
  type,
  unit,
  label,
  icon,
  tooltip,
  setInputValue,
  maxValue,
  onBlur,
  isInteger,
  isRequired,
  ...props
}: Props) {
  let inputHtmlType = type;
  if (type === 'percent') {
    inputHtmlType = 'text';
  }
  const [inputType, setInputType] = useState(inputHtmlType);
  const overlay: any = useRef<OverlayPanel>(null);

  const eyeClickHandler = () => {
    if (inputType === 'password') {
      setInputType('text');
    } else {
      setInputType('password');
    }
  };

  const renderEyeIcon = () => {
    return type === 'password' ? <EyeIcon onClick={eyeClickHandler} /> : null;
  };

  const handleInput = (e: any) => {
    if ((inputType === 'number' || inputType === 'percent') && isNumber(parseFloat(e.target.value))) {
      if (props.step) {
        setFieldValue(field.name, getNumberByStep(e.target.value, props.step));
      } else {
        setFieldValue(field.name, parseFloat(e.target.value));
      }
    } else {
      setFieldValue(field.name, e.target.value);
    }
    if (isInteger && isNumber(parseFloat(e.target.value)) && parseFloat(e.target.value) < 0) {
      setFieldValue(field.name, 0);
    }
    if (maxValue && isNumber(parseFloat(e.target.value)) && parseFloat(e.target.value) > maxValue) {
      setFieldValue(field.name, maxValue);
    }
    if (setInputValue) {
      setInputValue(e.target.value);
    }
  };

  const handleMouseOver = (e: any) => {
    if (overlay.current) {
      overlay.current.show(e);
    }
  };

  const handleMouseOut = (e: any) => {
    if (overlay.current) {
      overlay.current.hide();
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleMaxClick = () => {
    setFieldValue(field.name, maxValue);
  };

  const isInvalid = () => {
    if (field.name.indexOf('.') === -1) {
      return touched[field.name] && errors[field.name];
    } else {
      return get(errors, field.name);
    }
  };

  return (
    <div className="form-control full-width">
      <div className="p-inputgroup">
        {label && (
          <span className="input-label">
            {label} {isRequired && <span className="clr-red">*</span>}
          </span>
        )}
        {inputType === 'password' ? renderEyeIcon() : icon && <img className="start-icon" src={icon} />}
        <>
          {inputType === 'textarea' ? (
            <textarea
              {...field}
              {...props}
              onChange={handleInput}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onBlur={handleMouseOut}
            />
          ) : (
            <input
              type={inputType}
              {...field}
              {...props}
              onChange={handleInput}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
              onBlur={handleMouseOut}
            />
          )}
          {type === 'password' && tooltip && (
            <OverlayPanel ref={overlay} showCloseIcon={true} dismissable={true} appendTo={document.body}>
              {tooltip && <div dangerouslySetInnerHTML={{ __html: tooltip }} className="password-tooltip"></div>}
            </OverlayPanel>
          )}
        </>

        {type === 'percent' && <span className="percentage">%</span>}
        {unit && <span className="input-unit">{unit}</span>}
        {maxValue && <Button label="Max" {...props} type="button" onClick={handleMaxClick} />}
      </div>
      <div className="d-block">
        {isInvalid() && !maxValue ? <InfoCircleIcon /> : ''}
        {isInvalid() && <div className="input-feedback d-inline-block pl-4">{get(errors, field.name)}</div>}
      </div>
    </div>
  );
}

export default TextInput;
