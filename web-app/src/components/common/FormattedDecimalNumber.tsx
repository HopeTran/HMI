import classnames from 'classnames';
import React from 'react';
import { FormattedNumber, FormatNumberOptions, IntlProvider } from 'react-intl';

import { CURRENCY } from 'constants/constant';
import { getFormattedNumberWithAbbreviation } from 'utilities/common';

const extraFormat = (type: string, formattedNumber: string) => {
  switch (type) {
    case 'currency':
      return formattedNumber;
    case 'pnl':
      return formattedNumber[0] === '-'
        ? '(' + formattedNumber.substring(1, formattedNumber.length) + ')'
        : formattedNumber;
    case 'sign':
      return formattedNumber[0] === '-' || formattedNumber === '0' ? formattedNumber : '+' + formattedNumber;
  }
};

const negativePositiveStyling = (formattedNumber: string) => {
  if (formattedNumber !== '0') {
    return formattedNumber[0] === '-' ? 'negative' : 'positive';
  }
  return '';
};

export const WithCurrencyFormat = (formattedNumber: string) => <span>{extraFormat('currency', formattedNumber)}</span>;

export const WithContractFormat = (formattedNumber: string) => (
  <span className="text-initial">{formattedNumber} (Contracts)</span>
);

export const WithPLFormat = (formattedNumber: string) => {
  return <span className={negativePositiveStyling(formattedNumber)}>{extraFormat('pnl', formattedNumber)}</span>;
};

export const WithPLAndCurrencyFormat = (formattedNumber: string) => {
  const splitWithCurrency = formattedNumber.split(' ');
  return (
    <span className={negativePositiveStyling(formattedNumber)}>
      {extraFormat('pnl', splitWithCurrency[0])} {splitWithCurrency[1]}
    </span>
  );
};

export const WithSignFormat = (formattedNumber: string) => {
  return <span className={negativePositiveStyling(formattedNumber)}>{extraFormat('sign', formattedNumber)}</span>;
};

export const WithPercentageFormat = (formattedNumber: string) => {
  const value = Number(formattedNumber.substr(0, formattedNumber.indexOf('%')));
  const className = formattedNumber[0] === '-' ? 'negative' : value > 0 ? 'positive' : '';

  return <span className={className}>{value !== 0 ? extraFormat('sign', formattedNumber) : formattedNumber}</span>;
};

export const WithStyledFraction = (value: string) => {
  const splitedData = value.split('.');
  return (
    <>
      <span className="integer-value">{splitedData[0]}</span>
      {splitedData.length === 2 && (
        <>
          <span className="integer-value">.</span>
          <span className="fraction-value">{splitedData[1]}</span>
        </>
      )}
    </>
  );
};

export interface FormattedDecimalNumberProps extends FormatNumberOptions {
  withAbbreviation?: boolean;
  className?: string;
  format?: string;
  value: number;
  children?: (formattedNumber: string) => React.ReactNode;
}

export default function FormattedDecimalNumber(props: FormattedDecimalNumberProps) {
  const {
    currency,
    children,
    value,
    withAbbreviation,
    className,
    style,
    maximumFractionDigits,
    minimumFractionDigits,
    ...restProps
  } = props;

  const numberFormatted = getFormattedNumberWithAbbreviation(value, withAbbreviation);

  const childrenTemplate = (formattedNumber: string) => {
    if (withAbbreviation) {
      const [numberValue, ...rest] = formattedNumber.split(' ');
      formattedNumber = `${numberValue}${numberFormatted.abbreviation} ${rest.join(' ')}`;
    }
    return children ? children(formattedNumber) : formattedNumber;
  };

  const usdFormat = (
    <FormattedNumber
      {...restProps}
      currency={currency}
      currencyDisplay="symbol"
      value={numberFormatted.value}
      style="currency"
      children={childrenTemplate}
    />
  );

  const numberFormat = (
    <>
      <FormattedNumber
        {...restProps}
        currencyDisplay="name"
        value={numberFormatted.value}
        style={style || 'decimal'}
        maximumFractionDigits={maximumFractionDigits !== undefined ? maximumFractionDigits : 8}
        minimumFractionDigits={minimumFractionDigits !== undefined ? minimumFractionDigits : 0}
        children={childrenTemplate}
      />

      {currency && <span className="text-uppercase"> {currency}</span>}
    </>
  );

  return !isNaN(value) ? (
    <span className={classnames('number', className)}>
      <IntlProvider locale="en">{currency === CURRENCY.USD ? usdFormat : numberFormat}</IntlProvider>
    </span>
  ) : (
    <></>
  );
}
