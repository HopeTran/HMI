import classnames from 'classnames';
import React from 'react';
import { toUpper } from 'lodash';
import NumberFormat from 'react-number-format';
import { NumberFormatProps } from 'react-number-format';

import './NumericInput.scss';

interface Props extends NumberFormatProps {
  currency?: string;
  wrapperClassName?: string;
  className?: string;
  value?: any;
  decimalScale?: number;
  onValueChange?: any;
}

export default function NumericInput(props: Props) {
  return (
    <div
      className={classnames('number-format-wrapper', props.wrapperClassName, {
        'with-currency': props.currency,
      })}
    >
      <NumberFormat
        thousandsGroupStyle="thousand"
        decimalSeparator="."
        displayType="input"
        thousandSeparator={true}
        allowNegative={false}
        value={props.value}
        onValueChange={props.onValueChange}
        {...props}
      />
      {props.currency && <span className="pl-4">{toUpper(props.currency)}</span>}
    </div>
  );
}
